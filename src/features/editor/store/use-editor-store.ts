import { create } from "zustand";

import type { Id } from "../../../../convex/_generated/dataModel";

// The open tabs of ONE project
interface TabState {
  openTabs: Id<"files">[]; // in tab-bar order
  activeTabId: Id<"files"> | null; // the file shown in the editor
  previewTabId: Id<"files"> | null; // the italic "preview" tab, replaced by the next single click
}

const defaultTabState: TabState = {
  openTabs: [],
  activeTabId: null,
  previewTabId: null,
};

interface EditorStore {
  tabs: Map<Id<"projects">, TabState>; // each project remembers its own tabs
  getTabState: (projectId: Id<"projects">) => TabState;
  openFile: (projectId: Id<"projects">, fileId: Id<"files">, options: { pinned: boolean }) => void;
  closeTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
  closeAllTabs: (projectId: Id<"projects">) => void;
  setActiveTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
}

// A zustand store: global state that any component can read and change,
// without passing props. Every `set` makes the components that use it re-render.
export const useEditorStore = create<EditorStore>()((set, get) => ({
  tabs: new Map(),

  getTabState: (projectId) => {
    return get().tabs.get(projectId) ?? defaultTabState;
  },

  openFile: (projectId, fileId, { pinned }) => {
    const tabs = new Map(get().tabs); // a NEW Map, so zustand sees the change
    const state = tabs.get(projectId) ?? defaultTabState;
    const { openTabs, previewTabId } = state;
    const isOpen = openTabs.includes(fileId);

    // 1. Single click on a closed file: it becomes the preview tab,
    //    replacing the current preview tab if there is one
    if (!isOpen && !pinned) {
      const newTabs = previewTabId
        ? openTabs.map((id) => (id === previewTabId ? fileId : id))
        : [...openTabs, fileId];

      tabs.set(projectId, { openTabs: newTabs, activeTabId: fileId, previewTabId: fileId });
      set({ tabs });
      return;
    }

    // 2. Double click on a closed file: a new pinned tab
    if (!isOpen && pinned) {
      tabs.set(projectId, { ...state, openTabs: [...openTabs, fileId], activeTabId: fileId });
      set({ tabs });
      return;
    }

    // 3. Already open: just activate it (and pin it, if it was the preview tab and was double-clicked)
    const shouldPin = pinned && previewTabId === fileId;
    tabs.set(projectId, {
      ...state,
      activeTabId: fileId,
      previewTabId: shouldPin ? null : previewTabId,
    });
    set({ tabs });
  },

  closeTab: (projectId, fileId) => {
    const tabs = new Map(get().tabs);
    const state = tabs.get(projectId) ?? defaultTabState;
    const { openTabs, activeTabId, previewTabId } = state;
    const tabIndex = openTabs.indexOf(fileId);

    if (tabIndex === -1) return;

    const newTabs = openTabs.filter((id) => id !== fileId);

    // Closing the active tab activates its neighbour: the next one, or the last one
    let newActiveTabId = activeTabId;
    if (activeTabId === fileId) {
      if (newTabs.length === 0) newActiveTabId = null;
      else if (tabIndex >= newTabs.length) newActiveTabId = newTabs[newTabs.length - 1];
      else newActiveTabId = newTabs[tabIndex];
    }

    tabs.set(projectId, {
      openTabs: newTabs,
      activeTabId: newActiveTabId,
      previewTabId: previewTabId === fileId ? null : previewTabId,
    });
    set({ tabs });
  },

  closeAllTabs: (projectId) => {
    const tabs = new Map(get().tabs);
    tabs.set(projectId, defaultTabState);
    set({ tabs });
  },

  setActiveTab: (projectId, fileId) => {
    const tabs = new Map(get().tabs);
    const state = tabs.get(projectId) ?? defaultTabState;
    tabs.set(projectId, { ...state, activeTabId: fileId });
    set({ tabs });
  },
}));
