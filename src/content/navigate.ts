function clickAnchor(url: string): boolean {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
  const delivered = anchor.dispatchEvent(event);
  anchor.remove();
  return !delivered;
}

export function navigateTo(url: string): void {
  const sameOrigin = new URL(url, location.href).origin === location.origin;
  if (sameOrigin && clickAnchor(url)) return;
  window.location.assign(url);
}
