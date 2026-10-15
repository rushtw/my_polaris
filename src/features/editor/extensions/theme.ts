import { EditorView } from "@codemirror/view";

// Layout and font on top of the One Dark colour theme
export const customTheme = EditorView.theme({
  "&": {
    outline: "none !important",
    height: "100%",
  },
  ".cm-content": {
    // the IBM Plex Mono font defined in src/app/layout.tsx
    fontFamily: "var(--font-ibm-plex-mono), monospace",
    fontSize: "14px",
  },
  ".cm-scroller": {
    scrollbarWidth: "thin",
    scrollbarColor: "#3f3f46 transparent",
  },
});
