export interface KeyLikeEvent {
  key?: string;
  code?: string;
  keyCode?: number;
  which?: number;
}

export function isEnterKey(event: KeyLikeEvent): boolean {
  if (event.key === 'Enter' || event.code === 'Enter') return true;
  const keyCode = event.keyCode ?? event.which;
  return keyCode === 13;
}

export function isSpaceKey(event: KeyLikeEvent): boolean {
  if (event.key === ' ' || event.key === 'Spacebar' || event.code === 'Space')
    return true;
  const keyCode = event.keyCode ?? event.which;
  return keyCode === 32;
}

export function isActivationKey(event: KeyLikeEvent): boolean {
  return isEnterKey(event) || isSpaceKey(event);
}

export function isEscapeKey(event: KeyLikeEvent): boolean {
  if (event.key === 'Escape' || event.code === 'Escape') return true;
  const keyCode = event.keyCode ?? event.which;
  return keyCode === 27;
}

export function isTabKey(event: KeyLikeEvent): boolean {
  if (event.key === 'Tab' || event.code === 'Tab') return true;
  const keyCode = event.keyCode ?? event.which;
  return keyCode === 9;
}

let ariaIdCounter = 0;

export interface CreateAriaIdOptions {
  prefix?: string;
  separator?: string;
}

export function createAriaId(options: CreateAriaIdOptions = {}): string {
  const prefix = options.prefix ?? 'tigercat';
  const separator = options.separator ?? '-';
  ariaIdCounter += 1;
  return `${prefix}${separator}${ariaIdCounter}`;
}
