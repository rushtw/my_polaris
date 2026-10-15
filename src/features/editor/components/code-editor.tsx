"use client";

import { useEffect, useMemo, useRef } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentWithTab } from "@codemirror/commands";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";

import { minimap } from "../extensions/minimap";
import { customTheme } from "../extensions/theme";
import { customSetup } from "../extensions/custom-setup";
import { getLanguageExtension } from "../extensions/language-extension";
import { suggestion } from "../extensions/suggestion";
import { quickEdit } from "../extensions/quick-edit";
import { selectionTooltip } from "../extensions/selection-tooltip";

interface CodeEditorProps {
  fileName: string;
  initialValue?: string;
  onChange: (value: string) => void;
}

// CodeMirror 6 inside React. CodeMirror isn't a React component: it builds its own
// DOM inside a <div> we give it (through a ref), and keeps the document itself.
// React only creates it once (per file) and destroys it on unmount.
export const CodeEditor = ({ fileName, initialValue = "", onChange }: CodeEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Always call the LATEST onChange, even though CodeMirror's listener is set up once
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const languageExtension = useMemo(() => getLanguageExtension(fileName), [fileName]);

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: initialValue, // only used when the editor is created
      parent: editorRef.current,
      extensions: [
        oneDark, // always dark, as in Polaris
        customTheme,
        customSetup,
        languageExtension,
        suggestion(fileName), // AI ghost text; its Tab must come before indentWithTab
        quickEdit(), // Ctrl/⌘ K: rewrite the selection with AI
        selectionTooltip(), // the "Quick Edit" button under a selection
        keymap.of([indentWithTab]), // Tab indents instead of leaving the editor
        minimap(),
        indentationMarkers(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
    });

    return () => view.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialValue is only the starting document
  }, [languageExtension]);

  return <div ref={editorRef} className="size-full pl-4 bg-background" />;
};
