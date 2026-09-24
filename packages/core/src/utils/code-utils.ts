import type { CodeHighlighter, CodeLanguage, HighlightToken } from '../types/code-editor'
import type { ColorScheme } from '../types/theme'
import { type ClassValue, classNames } from './class-names'
import { isBrowser } from './env'

export const codeBlockContainerClasses =
  'relative rounded-[var(--tiger-radius-md)] border border-[var(--tiger-border)] bg-[var(--tiger-surface-muted)] text-[var(--tiger-text)]'

export const codeBlockPreClasses =
  'm-0 overflow-auto p-4 text-sm leading-relaxed font-mono whitespace-pre'

export const codeBlockCopyButtonBaseClasses =
  'absolute end-3 top-3 inline-flex items-center justify-center min-h-6 min-w-6 rounded-[var(--tiger-radius-md)] border border-[var(--tiger-border)] bg-[var(--tiger-surface)] px-2 py-1 text-xs text-[var(--tiger-text-secondary)] shadow-sm transition-colors hover:text-[var(--tiger-text)] motion-reduce:transition-none'

export const codeBlockCopyButtonCopiedClasses =
  'border-[var(--tiger-primary)] text-[var(--tiger-primary)]'

export const codeBlockCopyButtonFailedClasses =
  'border-[var(--tiger-error)] text-[var(--tiger-error)]'

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

/**
 * `light` / `dark` from an explicit scheme, otherwise the document root.
 * `'auto'` and a missing scheme follow `data-tiger-color-scheme` or `.dark`.
 */
export function resolveCodeHighlightTheme(
  colorScheme?: ColorScheme | null
): 'light' | 'dark' {
  if (colorScheme === 'light' || colorScheme === 'dark') return colorScheme
  if (isBrowser()) {
    const root = document.documentElement
    const attr = root.getAttribute('data-tiger-color-scheme')
    if (attr === 'dark' || attr === 'light') return attr
    if (root.classList.contains('dark')) return 'dark'
  }
  return 'light'
}

/**
 * Tokens for a pluggable highlighter. Returns null when none is provided
 * so callers keep a plain-text `<code>` node. Theme is never pinned to light.
 */
export function highlightToTokens(
  code: string,
  language: string | undefined,
  highlighter: CodeHighlighter | undefined,
  theme?: 'light' | 'dark'
): HighlightToken[][] | null {
  if (!highlighter) return null
  const lang = (language ?? 'plain') as CodeLanguage
  const resolvedTheme = theme === 'dark' || theme === 'light' ? theme : resolveCodeHighlightTheme()
  if (highlighter.highlightLine) {
    return code.split('\n').map((line) => highlighter.highlightLine!(line, lang, resolvedTheme))
  }
  if (highlighter.highlightCode) {
    return highlighter.highlightCode(code, lang, resolvedTheme)
  }
  return null
}
