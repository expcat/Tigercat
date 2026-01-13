export interface FocusElementOptions {
  preventScroll?: boolean;
}

export function isHTMLElement(value: unknown): value is HTMLElement {
  if (typeof HTMLElement === 'undefined') return false;
  return value instanceof HTMLElement;
}

export function getActiveElement(doc?: Document): HTMLElement | null {
  const active = doc?.activeElement;
  return isHTMLElement(active) ? active : null;
}

export function captureActiveElement(
  doc: Document = document
): HTMLElement | null {
  return getActiveElement(doc);
}

export function focusElement(
  element: HTMLElement | null | undefined,
  options?: FocusElementOptions
): boolean {
  if (!element) return false;
  if (typeof element.focus !== 'function') return false;

  try {
    if (options) {
      element.focus(options);
    } else {
      element.focus();
    }
    return true;
  } catch {
    return false;
  }
}

export function focusFirst(
  candidates: Array<HTMLElement | null | undefined>,
  options?: FocusElementOptions
): HTMLElement | null {
  for (const el of candidates) {
    if (focusElement(el, options)) return el ?? null;
  }
  return null;
}

export function restoreFocus(
  previous: HTMLElement | null | undefined,
  options?: FocusElementOptions
): boolean {
  return focusElement(previous, options);
}
