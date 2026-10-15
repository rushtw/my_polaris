import { type Tooltip, type TooltipView, showTooltip, keymap, EditorView } from "@codemirror/view";
import { StateField, type EditorState, StateEffect } from "@codemirror/state";

import { fetcher } from "./fetcher";

// "⌘K" on a Mac, "Ctrl+K" elsewhere (CodeMirror's "Mod" key means the same)
export const quickEditShortcut =
  typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent) ? "⌘K" : "Ctrl+K";

// Opens (true) or closes (false) the Quick Edit prompt
export const showQuickEditEffect = StateEffect.define<boolean>();

// Is the Quick Edit prompt open? It closes by itself when the selection is gone.
export const quickEditState = StateField.define<boolean>({
  create() {
    return false;
  },
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(showQuickEditEffect)) return effect.value;
    }
    if (transaction.selection && transaction.state.selection.main.empty) return false;
    return value;
  },
});

const close = (view: EditorView) => view.dispatch({ effects: showQuickEditEffect.of(false) });

// The prompt itself: a small form under the selection. It's plain DOM, not React,
// because CodeMirror creates and removes it.
const createPromptView = (view: EditorView): TooltipView => {
  let abortController: AbortController | null = null;

  const dom = document.createElement("div");
  dom.className =
    "bg-popover text-popover-foreground z-50 rounded-sm border border-input p-2 shadow-md flex flex-col gap-2 text-sm";

  const form = document.createElement("form");
  form.className = "flex flex-col gap-2";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Edit selected code";
  input.className = "bg-transparent border-none outline-none px-2 py-1 font-sans w-100";
  // Escape closes the prompt and puts the focus back in the editor
  input.onkeydown = (event) => {
    if (event.key === "Escape") {
      close(view);
      view.focus();
    }
  };

  const buttons = document.createElement("div");
  buttons.className = "flex items-center justify-between gap-2";

  const buttonClass =
    "font-sans p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-sm";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancel";
  cancelButton.className = buttonClass;
  cancelButton.onclick = () => close(view); // destroy() below aborts the request

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Submit";
  submitButton.className = buttonClass;

  form.onsubmit = async (event) => {
    event.preventDefault();
    const instruction = input.value.trim();
    if (!instruction || abortController) return;

    // The selection as it is now; that's the text that gets replaced
    const { from, to } = view.state.selection.main;
    const selectedCode = view.state.doc.sliceString(from, to);
    const fullCode = view.state.doc.toString();

    submitButton.disabled = true;
    submitButton.textContent = "Editing...";

    const controller = new AbortController();
    abortController = controller;
    const editedCode = await fetcher({ selectedCode, fullCode, instruction }, controller.signal);
    abortController = null;

    // Cancelled, or the prompt closed meanwhile: change nothing
    if (controller.signal.aborted) return;

    if (editedCode) {
      // One transaction: replace the selection and close the prompt.
      // It's a normal document change, so the editor's auto-save picks it up.
      view.dispatch({
        changes: { from, to, insert: editedCode },
        selection: { anchor: from + editedCode.length },
        effects: showQuickEditEffect.of(false),
      });
      view.focus();
    } else {
      submitButton.disabled = false;
      submitButton.textContent = "Submit";
    }
  };

  buttons.append(cancelButton, submitButton);
  form.append(input, buttons);
  dom.append(form);

  return {
    dom,
    mount: () => input.focus(),
    // The prompt is removed (Cancel, Escape, selection changed...): stop its request
    destroy: () => abortController?.abort(),
  };
};

const createQuickEditTooltip = (state: EditorState): readonly Tooltip[] => {
  const selection = state.selection.main;
  if (selection.empty || !state.field(quickEditState)) return [];

  return [{ pos: selection.to, above: false, strictSide: false, create: createPromptView }];
};

// Which tooltips to show, recomputed when the text, selection or open state changes
const quickEditTooltipField = StateField.define<readonly Tooltip[]>({
  create(state) {
    return createQuickEditTooltip(state);
  },
  update(tooltips, transaction) {
    const toggled = transaction.effects.some((effect) => effect.is(showQuickEditEffect));
    if (transaction.docChanged || transaction.selection || toggled) {
      return createQuickEditTooltip(transaction.state);
    }
    return tooltips;
  },
  provide: (field) => showTooltip.computeN([field], (state) => state.field(field)),
});

// Ctrl/⌘ K with a selection opens the prompt
const quickEditKeymap = keymap.of([
  {
    key: "Mod-k",
    run: (view) => {
      if (view.state.selection.main.empty) return false;
      view.dispatch({ effects: showQuickEditEffect.of(true) });
      return true;
    },
  },
]);

export const quickEdit = () => [quickEditState, quickEditTooltipField, quickEditKeymap];
