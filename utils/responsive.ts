export function isLargeScreen(width: number) {
  return width >= 960;
}

export function contentMaxWidth(width: number) {
  // Keep content readable on big web screens.
  return Math.min(width, 1200);
}


