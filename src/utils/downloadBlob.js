// Triggers a browser file download from a blob response (used for the
// PDF receipt, which has to go through our authenticated API rather than
// a plain <a href> link, since the endpoint requires a JWT).
export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
