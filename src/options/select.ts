export interface SelectItem {
  id: string;
  label: string;
}

export interface SelectConfig {
  items: SelectItem[];
  value: string;
  onChange: (id: string) => void;
}

export function searchableSelect(config: SelectConfig): HTMLElement {
  let value = config.value;
  const root = document.createElement('div');
  root.className = 'sselect';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'sselect__trigger';

  const search = document.createElement('input');
  search.type = 'text';
  search.className = 'sselect__search';
  search.placeholder = 'Type to filter…';

  const list = document.createElement('div');
  list.className = 'sselect__list';
  list.setAttribute('role', 'listbox');

  const panel = document.createElement('div');
  panel.className = 'sselect__panel';
  panel.hidden = true;
  panel.append(search, list);
  root.append(trigger, panel);

  const labelOf = (id: string) => config.items.find((item) => item.id === id)?.label ?? id;

  const renderList = (query: string): void => {
    const needle = query.trim().toLowerCase();
    list.replaceChildren();
    for (const item of config.items) {
      if (needle && !item.label.toLowerCase().includes(needle)) continue;
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'sselect__option';
      option.textContent = item.label;
      option.setAttribute('role', 'option');
      if (item.id === value) option.dataset.selected = 'true';
      option.addEventListener('click', () => select(item.id));
      list.appendChild(option);
    }
  };

  const open = (state: boolean): void => {
    panel.hidden = !state;
    trigger.setAttribute('aria-expanded', String(state));
    if (state) {
      search.value = '';
      renderList('');
      search.focus();
    }
  };

  const select = (id: string): void => {
    value = id;
    trigger.textContent = labelOf(id);
    config.onChange(id);
    open(false);
  };

  trigger.textContent = labelOf(value);
  trigger.addEventListener('click', () => open(panel.hidden));
  search.addEventListener('input', () => renderList(search.value));
  search.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') open(false);
  });
  document.addEventListener('click', (event) => {
    if (!root.contains(event.target as Node)) open(false);
  });

  return root;
}
