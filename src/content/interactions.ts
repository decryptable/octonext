import { CSS_PREFIX } from '../shared/constants';
import { ripple } from '../ui/effects';

const RIPPLE_TARGETS = [`.${CSS_PREFIX}-dl__button`, `.${CSS_PREFIX}-tab`, `.${CSS_PREFIX}-toggle`];

export function attachRippleDelegation(root: HTMLElement): void {
  root.addEventListener('pointerdown', (event) => {
    const pointer = event as PointerEvent;
    const target = (pointer.target as HTMLElement | null)?.closest(RIPPLE_TARGETS.join(','));
    if (target instanceof HTMLElement) ripple(target, pointer);
  });
}
