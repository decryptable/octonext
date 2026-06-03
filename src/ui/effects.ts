import { CSS_PREFIX } from '../shared/constants';

export function ripple(host: HTMLElement, event: { clientX: number; clientY: number }): void {
  try {
    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const span = document.createElement('span');
    span.className = `${CSS_PREFIX}-ripple`;
    span.style.width = span.style.height = `${size}px`;
    span.style.left = `${event.clientX - rect.left - size / 2}px`;
    span.style.top = `${event.clientY - rect.top - size / 2}px`;
    span.addEventListener('animationend', () => span.remove(), { once: true });
    host.appendChild(span);
  } catch {
    void 0;
  }
}

export function pulse(node: HTMLElement, className: string, duration = 420): void {
  node.classList.add(className);
  window.setTimeout(() => node.classList.remove(className), duration);
}

export const flagOpening = (wrap: HTMLElement): void =>
  pulse(wrap, `${CSS_PREFIX}-node__children--opening`, 320);
