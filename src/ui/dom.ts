type Child = Node | string | number | false | null | undefined;

export interface ElementProps {
  class?: string;
  text?: string;
  title?: string;
  href?: string;
  type?: string;
  dataset?: Record<string, string>;
  attrs?: Record<string, string>;
  style?: Partial<CSSStyleDeclaration>;
  on?: Partial<Record<keyof HTMLElementEventMap, (event: Event) => void>>;
}

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: ElementProps = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props.class) el.className = props.class;
  if (props.text != null) el.textContent = props.text;
  if (props.title != null) el.title = props.title;
  if (props.href != null) el.setAttribute('href', props.href);
  if (props.type != null) el.setAttribute('type', props.type);
  if (props.dataset) Object.assign(el.dataset, props.dataset);
  if (props.attrs) for (const [k, v] of Object.entries(props.attrs)) el.setAttribute(k, v);
  if (props.style) Object.assign(el.style, props.style);
  if (props.on)
    for (const [name, fn] of Object.entries(props.on))
      el.addEventListener(name, fn as EventListener);
  appendChildren(el, children);
  return el;
}

export function appendChildren(parent: Node, children: Child[]): void {
  for (const child of children) {
    if (child == null || child === false) continue;
    parent.appendChild(typeof child === 'object' ? child : document.createTextNode(String(child)));
  }
}

export function clear(node: Node): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function svg(markup: string, className?: string): SVGElement {
  const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement;
  const node = document.importNode(parsed, true) as unknown as SVGElement;
  if (className) node.setAttribute('class', className);
  return node;
}
