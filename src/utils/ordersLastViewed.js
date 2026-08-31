// Tracks when the buyer last opened Order History, so the navbar can badge
// orders whose status changed (e.g. shipped/delivered) since then.
const KEY = 'kobobuy_orders_last_viewed';

export function getOrdersLastViewed() {
  return Number(localStorage.getItem(KEY) || 0);
}

export function markOrdersViewedNow() {
  localStorage.setItem(KEY, String(Date.now()));
}
