export function downloadApk(url, fileName) {
  if (!url) return;

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || 'myangar.apk';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
