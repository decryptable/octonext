import { CSS_PREFIX } from '../../shared/constants';
import { h } from '../dom';

export interface MessageAction {
  label: string;
  onClick: () => void;
}

export function message(
  variant: 'info' | 'error',
  text: string,
  action?: MessageAction,
): HTMLElement {
  return h(
    'div',
    { class: `${CSS_PREFIX}-message ${CSS_PREFIX}-message--${variant}` },
    h('p', { class: `${CSS_PREFIX}-message__text`, text }),
    action &&
      h('button', {
        class: `${CSS_PREFIX}-message__action`,
        type: 'button',
        text: action.label,
        on: { click: action.onClick },
      }),
  );
}
