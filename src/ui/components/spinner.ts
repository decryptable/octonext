import { CSS_PREFIX } from '../../shared/constants';
import { h } from '../dom';

export function spinner(label = 'Loading…'): HTMLElement {
  return h(
    'div',
    { class: `${CSS_PREFIX}-spinner` },
    h('span', { class: `${CSS_PREFIX}-spinner__ring` }),
    h('span', { class: `${CSS_PREFIX}-spinner__label`, text: label }),
  );
}
