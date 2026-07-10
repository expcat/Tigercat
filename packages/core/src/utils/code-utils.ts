import { type ClassValue, classNames } from './class-names'

export const codeBlockContainerClasses =
  'relative rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface-muted,#f9fafb)] text-[var(--tiger-text,#1f2937)]'

export const codeBlockPreClasses =
  'm-0 overflow-auto p-4 text-sm leading-relaxed font-mono whitespace-pre'

export const codeBlockCopyButtonBaseClasses =
  'absolute right-3 top-0 -translate-y-1/2 inline-flex items-center rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#fff)] px-1.5 py-0.5 text-[10px] text-[var(--tiger-text-muted,#6b7280)] shadow-sm transition-colors hover:text-[var(--tiger-text,#111827)] motion-reduce:transition-none'

export const codeBlockCopyButtonCopiedClasses =
  'border-[var(--tiger-primary,#2563eb)] text-[var(--tiger-primary,#2563eb)]'

export function getCodeBlockContainerClasses(...classes: ClassValue[]): string {
  return classNames(codeBlockContainerClasses, ...classes)
}

export function getCodeBlockCopyButtonClasses(isCopied: boolean, ...classes: ClassValue[]): string {
  return classNames(
    codeBlockCopyButtonBaseClasses,
    isCopied && codeBlockCopyButtonCopiedClasses,
    ...classes
  )
}
