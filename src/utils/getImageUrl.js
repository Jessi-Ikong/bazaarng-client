// Product images can be either a full external URL (pasted manually,
// e.g. during earlier testing) or a relative path returned by our own
// upload endpoint (e.g. /uploads/xyz.jpg). This normalizes both to a
// URL the browser can actually load.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_URL = API_URL.replace(/\/api\/?$/, '');

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SERVER_URL}${path}`;
}
