/**
 * True for an unmodified left click, the only click an in-app link should take
 * over. A middle click or a Ctrl/Cmd/Shift/Alt click means "open in a new tab",
 * "new window", or "download", so the browser has to be left to do it.
 */
export function isPlainLeftClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
