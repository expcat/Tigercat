import { type ClassValue, classNames } from './class-names'

export const codeBlockContainerClasses =
  'relative rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface-muted,#f9fafb)] text-[var(--tiger-text,#1f2937)]'

export const codeBlockPreClasses =
  'm-0 overflow-auto p-4 text-sm leading-relaxed font-mono whitespace-pre'

export const codeBlockCopyButtonBaseClasses =
  'absolute end-3 top-0 -translate-y-1/2 inline-flex items-center justify-center min-h-6 min-w-6 rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#fff)] px-2 py-1 text-xs text-[var(--tiger-text-muted,#6b7280)] shadow-sm transition-colors hover:text-[var(--tiger-text,#111827)] motion-reduce:transition-none'

export const codeBlockCopyButtonCopiedClasses =
  'border-[var(--tiger-primary,#2563eb)] text-[var(--tiger-primary,#2563eb)]'

export const codeBlockCopyButtonFailedClasses =
  'border-[var(--tiger-error,#ef4444)] text-[var(--tiger-error,#ef4444)]'

export const codeBlockCopyStatusLiveClasses = 'sr-only'

export type CodeCopyButtonStatus = 'idle' | 'copied' | 'failed'

export const CODE_COPY_STATUS_RESET_MS = 1500

export function getCodeBlockContainerClasses(...classes: ClassValue[]): string {
  return classNames(codeBlockContainerClasses, ...classes)
}

export function getCodeBlockCopyButtonClasses(
  status: CodeCopyButtonStatus = 'idle',
  ...classes: ClassValue[]
): string {
  return classNames(
    codeBlockCopyButtonBaseClasses,
    status === 'copied' && codeBlockCopyButtonCopiedClasses,
    status === 'failed' && codeBlockCopyButtonFailedClasses,
    ...classes
  )
}

export function createCopyStatusReset(
  setStatus: (status: CodeCopyButtonStatus) => void,
  resetMs: number = CODE_COPY_STATUS_RESET_MS
): {
  schedule: (status: Exclude<CodeCopyButtonStatus, 'idle'>) => void
  dispose: () => void
} {
  let timer: ReturnType<typeof setTimeout> | null = null

  const dispose = () => {
    if (timer != null) {
      clearTimeout(timer)
      timer = null
    }
  }

  return {
    schedule(status) {
      dispose()
      setStatus(status)
      timer = setTimeout(() => {
        setStatus('idle')
        timer = null
      }, resetMs)
    },
    dispose
  }
}
