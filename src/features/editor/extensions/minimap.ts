import { showMinimap } from "@replit/codemirror-minimap";

// An empty box for the minimap; the package draws the miniature file into it
const createMinimap = () => {
  const dom = document.createElement("div");
  return { dom };
};

export const minimap = () => [
  showMinimap.compute(["doc"], () => {
    return { create: createMinimap };
  }),
];
