import React, { useState } from 'react'
import { Button } from '@expcat/tigercat-react'
import type { DemoLang } from '@demo-shared/app-config'

interface AxeNode {
  target: string[]
  html: string
  failureSummary?: string
}
interface AxeViolation {
  id: string
  impact?: 'minor' | 'moderate' | 'serious' | 'critical' | null
  description: string
  help: string
  helpUrl: string
  nodes: AxeNode[]
}
interface AxeResults {
  violations: AxeViolation[]
}

export interface A11yDebugPanelProps {
  lang?: DemoLang
  targetSelector?: string
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

export const A11yDebugPanel: React.FC<A11yDebugPanelProps> = ({ lang = 'zh-CN', targetSelector }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ranAt, setRanAt] = useState('')
  const [results, setResults] = useState<AxeResults | null>(null)
  const [error, setError] = useState('')

  const t = (zh: string, en: string) => (lang === 'zh-CN' ? zh : en)

  const runScan = async () => {
    setLoading(true)
    setError('')
    try {
      const axe = (await import('axe-core')).default
      const target = targetSelector ? document.querySelector(targetSelector) : document.body
      const r = (await axe.run(target ?? document.body, {
        resultTypes: ['violations']
      })) as AxeResults
      setResults(r)
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
        onClick={() => setOpen((p) => !p)}>
        ♿
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('A11y 调试面板', 'A11y debug panel')}
          className="absolute bottom-14 right-0 w-[min(420px,calc(100vw-2rem))] max-h-[70vh] flex flex-col rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
          <header className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('无障碍扫描 (axe-core)', 'A11y scan (axe-core)')}
            </div>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              aria-label={t('关闭', 'Close')}
              onClick={() => setOpen(false)}>
              ✕
            </button>
          </header>

          <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800">
            <Button size="sm" loading={loading} onClick={runScan}>
              {t('运行扫描', 'Run scan')}
            </Button>
            {ranAt && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('最近扫描', 'Last scan')}: {ranAt}
              </span>
            )}
            {results && (
              <span className="ml-auto text-xs text-gray-700 dark:text-gray-300">
                {results.violations.length} {t('个问题', 'issues')}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {error ? (
              <p className="text-red-600 dark:text-red-400">{error}</p>
            ) : !results ? (
              <p className="text-gray-500 dark:text-gray-400">
                {t('点击「运行扫描」查看当前页面的无障碍问题。', 'Click "Run scan" to inspect the current page.')}
              </p>
            ) : results.violations.length === 0 ? (
              <p className="text-emerald-700 dark:text-emerald-300">
                {t('未发现问题 ✓', 'No violations found ✓')}
              </p>
            ) : (
              <ul className="space-y-3">
                {results.violations.map((v) => (
                  <li
                    key={v.id}
                    className="rounded-md border border-gray-200 p-2 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-semibold uppercase rounded px-1.5 py-0.5 ${impactColor(v.impact)}`}>
                        {v.impact ?? 'n/a'}
                      </span>
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{v.id}</span>
                    </div>
                    <div className="text-gray-900 dark:text-gray-100">{v.help}</div>
                    <a
                      href={v.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--tiger-primary,#2563eb)] hover:underline">
                      {t('查看详情 →', 'Learn more →')}
                    </a>
                    <details className="mt-1">
                      <summary className="text-xs text-gray-500 cursor-pointer dark:text-gray-400">
                        {v.nodes.length} {t('个节点', 'node(s)')}
                      </summary>
                      <ul className="mt-1 space-y-1">
                        {v.nodes.map((n, i) => (
                          <li
                            key={i}
                            className="text-xs font-mono text-gray-600 dark:text-gray-300 break-all">
                            {n.target.join(' ')}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default A11yDebugPanel
