import React, { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Modal } from '@expcat/tigercat-react/Modal'
import type { DemoLang } from '@demo-shared/app-config'
import { demoChrome } from '@demo-shared/chrome'

interface AxeNode {
  target: string[]
  html: string
}
interface AxeViolation {
  id: string
  impact?: 'minor' | 'moderate' | 'serious' | 'critical' | null
  help: string
  helpUrl: string
  nodes: AxeNode[]
}
interface AxeResults {
  violations: AxeViolation[]
}

export interface A11yDebugPanelProps {
  lang?: DemoLang
}

const impactColor = (impact?: string | null) => {
  switch (impact) {
    case 'critical':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
    case 'serious':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200'
    case 'moderate':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
    case 'minor':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
  }
}

function collectPreviewRoots(): HTMLElement[] {
  const roots: HTMLElement[] = []
  for (const iframe of document.querySelectorAll<HTMLIFrameElement>('[data-demo-id] iframe')) {
    try {
      const body = iframe.contentDocument?.body
      if (body) roots.push(body)
    } catch {
      // opaque origin
    }
  }
  return roots
}

export const A11yDebugPanel: React.FC<A11yDebugPanelProps> = ({ lang = 'zh-CN' }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ranAt, setRanAt] = useState('')
  const [results, setResults] = useState<AxeResults | null>(null)
  const [scopedToPreview, setScopedToPreview] = useState(true)
  const [error, setError] = useState('')
  const t = (zh: string, en: string) => (lang === 'zh-CN' ? zh : en)

  const runScan = async () => {
    setLoading(true)
    setError('')
    try {
      const axe = (await import('axe-core')).default
      const roots = collectPreviewRoots()
      const targets = roots.length > 0 ? roots : [document.body]
      setScopedToPreview(roots.length > 0)
      const merged: AxeViolation[] = []
      for (const target of targets) {
        const r = (await axe.run(target, { resultTypes: ['violations'] })) as AxeResults
        merged.push(...r.violations)
      }
      setResults({ violations: merged })
      setRanAt(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60]">
      <button
        type="button"
        aria-label={t('A11y 调试面板', 'A11y debug panel')}
        aria-expanded={open}
        className="size-11 rounded-full shadow-lg bg-[var(--tiger-primary,#2563eb)] text-white font-bold text-base hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tiger-primary,#2563eb)]"
        onClick={() => setOpen(true)}>
        ♿
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('无障碍扫描 (axe-core)', 'A11y scan (axe-core)')}
        footer={null}>
        <div className="flex items-center gap-2 mb-3">
          <Button size="sm" loading={loading} onClick={() => void runScan()}>
            {t('运行扫描', 'Run scan')}
          </Button>
          {ranAt ? (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('最近扫描', 'Last scan')}: {ranAt}
            </span>
          ) : null}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {scopedToPreview
            ? t('扫描当前页可见的示例预览。', 'Scans visible example previews.')
            : t('只扫壳，不含预览。', 'Shell only; previews were not readable.')}
        </p>
        {error ? <p className="text-red-600 dark:text-red-400">{error}</p> : null}
        {results && results.violations.length === 0 ? (
          <p className="text-emerald-700 dark:text-emerald-300">
            {t('未发现问题 ✓', 'No violations found ✓')}
          </p>
        ) : null}
        {results && results.violations.length > 0 ? (
          <ul className="space-y-3 max-h-[50vh] overflow-y-auto">
            {results.violations.map((v, index) => (
              <li
                key={`${v.id}-${index}`}
                className="rounded-md border border-gray-200 p-2 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-semibold uppercase rounded px-1.5 py-0.5 ${impactColor(v.impact)}`}>
                    {v.impact ?? 'n/a'}
                  </span>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{v.id}</span>
                </div>
                <div className="text-gray-900 dark:text-gray-100">{v.help}</div>
              </li>
            ))}
          </ul>
        ) : null}
        <span className="sr-only">{demoChrome(lang).settings}</span>
      </Modal>
    </div>
  )
}

export default A11yDebugPanel
