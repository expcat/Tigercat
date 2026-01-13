import { isEscapeKey, isEventOutside } from '@tigercat/core';
import type { Ref } from 'vue';

export interface UseVueClickOutsideOptions {
  enabled: Ref<boolean>;
  containerRef: Ref<HTMLElement | null>;
  onOutsideClick: () => void;
  defer?: boolean;
}

export function useVueClickOutside({
  enabled,
  containerRef,
  onOutsideClick,
  defer = false,
}: UseVueClickOutsideOptions): () => void {
  let timer: number | undefined;

  const handler = (event: MouseEvent) => {
    if (!enabled.value) return;
    const container = containerRef.value;
    if (!container) return;

    if (isEventOutside(event, [container])) {
      onOutsideClick();
    }
  };

  const attach = () => document.addEventListener('click', handler);
  const detach = () => document.removeEventListener('click', handler);

  if (!defer) {
    attach();
    return () => detach();
  }

  timer = window.setTimeout(() => attach(), 0);
  return () => {
    if (timer !== undefined) window.clearTimeout(timer);
    detach();
  };
}

export interface UseVueEscapeKeyOptions {
  enabled: Ref<boolean>;
  onEscape: () => void;
}

export function useVueEscapeKey({
  enabled,
  onEscape,
}: UseVueEscapeKeyOptions): () => void {
  const handler = (event: KeyboardEvent) => {
    if (!enabled.value) return;
    if (event.defaultPrevented) return;
    if (!isEscapeKey(event)) return;
    onEscape();
  };

  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}
