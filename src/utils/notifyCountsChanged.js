// Fired after any action that could change a navbar badge count (an offer
// responded to, a message sent/read, an order viewed) so Navbar can refetch
// immediately instead of waiting for its next poll tick.
const COUNTS_CHANGED_EVENT = 'bazaarng:counts-changed';

export function notifyCountsChanged() {
  window.dispatchEvent(new Event(COUNTS_CHANGED_EVENT));
}

export function onCountsChanged(handler) {
  window.addEventListener(COUNTS_CHANGED_EVENT, handler);
  return () => window.removeEventListener(COUNTS_CHANGED_EVENT, handler);
}
