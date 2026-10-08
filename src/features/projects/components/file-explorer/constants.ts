// Left padding (px) of root-level rows, just below the project header
export const BASE_PADDING = 12;
// Extra left padding per nesting level
export const LEVEL_PADDING = 12;

// Indentation of a row. Files get 16px more because they have no ▸ chevron,
// so their icon lines up with the folder icons at the same level.
export const getItemPadding = (level: number, isFile: boolean) => {
  const fileOffset = isFile ? 16 : 0;
  return BASE_PADDING + level * LEVEL_PADDING + fileOffset;
};
