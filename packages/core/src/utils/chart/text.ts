/** Conservative width for the charts' 12px labels, including full-width glyphs. */
export function estimateChartTextWidth(text: string): number {
  return Array.from(text).reduce((width, char) => width + (char.charCodeAt(0) < 256 ? 7.2 : 12), 0)
}
