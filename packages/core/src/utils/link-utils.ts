import { type LinkSize, type LinkProps } from '../types/link';

export const linkBaseClasses =
  'inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer no-underline';

export const linkSizeClasses: Record<LinkSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const linkDisabledClasses =
  'cursor-not-allowed opacity-60 pointer-events-none';

export function getSecureRel(
  target: LinkProps['target'] | undefined,
  rel: string | undefined
): string | undefined {
  if (target === '_blank' && !rel) return 'noopener noreferrer';
  return rel;
}
