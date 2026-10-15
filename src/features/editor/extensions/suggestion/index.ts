import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
  keymap,
} from "@codemirror/view";
import { StateEffect, StateField } from "@codemirror/state";

import { fetcher, type SuggestionRequest } from "./fetcher";

// Wait this long after the last keystroke / cursor move before asking the AI
// (Polaris uses 300 ms; 600 ms sends fewer requests while typing quickly)
const DEBOUNCE_DELAY = 600;

// StateEffect: a "message" that updates editor state. This one sets the suggestion.
const setSuggestionEffect = StateEffect.define<string | null>();

// StateField: the current suggestion, stored inside the editor's state.
// - create(): the starting value
// - update(): runs on every transaction (keystroke, cursor move, effect...)
const suggestionState = StateField.define<string | null>({
  create() {
    return null;
  },
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(setSuggestionEffect)) return effect.value;
    }
    // Typing or moving the cursor makes the old suggestion stale: hide it
    // (a new one is requested after the next pause)
    if (transaction.docChanged || transaction.selection) return null;
    return value;
  },
});

// WidgetType: a DOM element drawn into the editor that isn't part of the text
class SuggestionWidget extends WidgetType {
  constructor(readonly text: string) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.textContent = this.text;
    span.style.opacity = "0.4"; // ghost text
    span.style.pointerEvents = "none"; // clicks go to the editor
    return span;
  }
}

// Everything the AI gets: the whole file, plus the cursor's line and 5 lines around it
const generatePayload = (view: EditorView, fileName: string): SuggestionRequest | null => {
  const code = view.state.doc.toString();
  if (code.trim().length === 0) return null;

  const doc = view.state.doc;
  const cursor = view.state.selection.main.head;
  const line = doc.lineAt(cursor);
  const cursorInLine = cursor - line.from;

  const previousLines: string[] = [];
  for (let n = Math.max(1, line.number - 5); n < line.number; n++) {
    previousLines.push(doc.line(n).text);
  }

  const nextLines: string[] = [];
  for (let n = line.number + 1; n <= Math.min(doc.lines, line.number + 5); n++) {
    nextLines.push(doc.line(n).text);
  }

  return {
    fileName,
    code,
    currentLine: line.text,
    previousLines: previousLines.join("\n"),
    textBeforeCursor: line.text.slice(0, cursorInLine),
    textAfterCursor: line.text.slice(cursorInLine),
    nextLines: nextLines.join("\n"),
    lineNumber: line.number,
  };
};

// ViewPlugin 1: decides WHEN to ask. Each change restarts the timer and aborts
// the request still in flight, so only the latest pause produces a suggestion.
const createDebouncePlugin = (fileName: string) =>
  ViewPlugin.fromClass(
    class {
      timer: number | null = null;
      abortController: AbortController | null = null;

      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet) {
          this.trigger(update.view);
        }
      }

      cancel() {
        if (this.timer !== null) window.clearTimeout(this.timer);
        this.abortController?.abort();
        this.timer = null;
        this.abortController = null;
      }

      trigger(view: EditorView) {
        this.cancel();

        // No suggestions while text is selected (that's for Quick Edit)
        if (!view.state.selection.main.empty) return;

        this.timer = window.setTimeout(async () => {
          const payload = generatePayload(view, fileName);
          if (!payload) return;

          const controller = new AbortController();
          this.abortController = controller;
          const suggestion = await fetcher(payload, controller.signal);

          // Aborted meanwhile (more typing, or the editor closed): drop the answer
          if (controller.signal.aborted) return;
          view.dispatch({ effects: setSuggestionEffect.of(suggestion) });
        }, DEBOUNCE_DELAY);
      }

      destroy() {
        this.cancel();
      }
    },
  );

// ViewPlugin 2: draws the suggestion as ghost text right after the cursor
const renderPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.build(view);
    }

    update(update: ViewUpdate) {
      const suggestionChanged = update.transactions.some((transaction) =>
        transaction.effects.some((effect) => effect.is(setSuggestionEffect)),
      );
      if (update.docChanged || update.selectionSet || suggestionChanged) {
        this.decorations = this.build(update.view);
      }
    }

    build(view: EditorView) {
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) return Decoration.none;

      const cursor = view.state.selection.main.head;
      return Decoration.set([
        Decoration.widget({
          widget: new SuggestionWidget(suggestion),
          side: 1, // after the cursor, not before it
        }).range(cursor),
      ]);
    }
  },
  { decorations: (plugin) => plugin.decorations }, // tells CodeMirror to draw them
);

// Tab accepts the suggestion. Must come BEFORE indentWithTab in the extension list.
const acceptSuggestionKeymap = keymap.of([
  {
    key: "Tab",
    run: (view) => {
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) return false; // nothing to accept: let Tab indent

      const cursor = view.state.selection.main.head;
      view.dispatch({
        changes: { from: cursor, insert: suggestion },
        selection: { anchor: cursor + suggestion.length }, // cursor to its end
        effects: setSuggestionEffect.of(null),
      });
      return true; // handled: don't indent
    },
  },
]);

export const suggestion = (fileName: string) => [
  suggestionState,
  createDebouncePlugin(fileName),
  renderPlugin,
  acceptSuggestionKeymap,
];
