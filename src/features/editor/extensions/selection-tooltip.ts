import { type Tooltip, type TooltipView, showTooltip, EditorView } from "@codemirror/view";
import { StateField, type EditorState } from "@codemirror/state";

import { quickEditShortcut, quickEditState, showQuickEditEffect } from "./quick-edit";

// The small toolbar under a selection. Polaris also has "Add to Chat" here;
// it's left out until the chat exists (Chapter 12).
const createToolbarView = (view: EditorView): TooltipView => {
  const dom = document.createElement("div");
  dom.className =
    "bg-popover text-popover-foreground z-50 rounded-sm border border-input p-1 shadow-md flex items-center gap-2 text-sm";

  const quickEditButton = document.createElement("button");
  quickEditButton.className =
    "font-sans p-1 px-2 hover:bg-foreground/10 rounded-sm flex items-center gap-1";

  const label = document.createElement("span");
  label.textContent = "Quick Edit";

  const shortcut = document.createElement("span");
  shortcut.textContent = quickEditShortcut;
  shortcut.className = "text-sm opacity-60";

  quickEditButton.append(label, shortcut);
  quickEditButton.onclick = () => view.dispatch({ effects: showQuickEditEffect.of(true) });

  dom.append(quickEditButton);
  return { dom };
};

// Shown when text is selected, unless the Quick Edit prompt is open instead
const createTooltipForSelection = (state: EditorState): readonly Tooltip[] => {
  const selection = state.selection.main;
  if (selection.empty || state.field(quickEditState)) return [];

  return [{ pos: selection.to, above: false, strictSide: false, create: createToolbarView }];
};

const selectionTooltipField = StateField.define<readonly Tooltip[]>({
  create(state) {
    return createTooltipForSelection(state);
  },
  update(tooltips, transaction) {
    const toggled = transaction.effects.some((effect) => effect.is(showQuickEditEffect));
    if (transaction.docChanged || transaction.selection || toggled) {
      return createTooltipForSelection(transaction.state);
    }
    return tooltips;
  },
  provide: (field) => showTooltip.computeN([field], (state) => state.field(field)),
});

// Needs quickEdit() in the same editor (it reads quickEditState)
export const selectionTooltip = () => [selectionTooltipField];
