import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Tabs, TabPane, Code } from '@expcat/tigercat-react'
import { copyTextToClipboard } from '@expcat/tigercat-core'

interface DemoBlockProps {
  title: string
  description?: string
  code: string
  children: React.ReactNode
  className?: string
}

const panelBaseClasses =
  'rounded-b-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/40'
const previewPanelClasses = `p-6 ${panelBaseClasses}`
const codePanelClasses = `relative p-4 ${panelBaseClasses}`
const exampleBoxClasses =
  'rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900'
const copyButtonClasses =
  'absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white/90 px-2 py-1 text-xs text-gray-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100'

interface CopyButtonProps {
  code: string
}

const CopyButton: React.FC<CopyButtonProps> = ({ code }) => {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  const handleCopy = useCallback(async () => {
    const ok = await copyTextToClipboard(code)
    if (!ok) return
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setCopied(false)
      timerRef.current = null
    }, 1600)
  }, [code])

  return (
    <button
      type="button"
      className={copyButtonClasses}
      aria-label={copied ? '已复制' : '复制代码'}
      onClick={handleCopy}>
      <span aria-hidden="true">{copied ? '✓' : '⧉'}</span>
      <span>{copied ? '已复制' : '复制'}</span>
    </button>
  )
}

const DemoBlock: React.FC<DemoBlockProps> = ({ title, description, code, children, className }) => {
  const [activeKey, setActiveKey] = useState('preview')
  const sectionClasses = className ? `mb-12 ${className}` : 'mb-12'

  return (
    <section className={sectionClasses}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        {description ? <p className="text-gray-600">{description}</p> : null}
      </div>

      <div className="rounded-lg">
        <Tabs activeKey={activeKey} onChange={(key) => setActiveKey(String(key))} type="card">
          <TabPane tabKey="preview" label="示例" />
          <TabPane tabKey="code" label="代码" />
          <TabPane tabKey="mixed" label="混合" />
        </Tabs>
        {activeKey === 'preview' && <div className={previewPanelClasses}>{children}</div>}
        {activeKey === 'code' && (
          <div className={codePanelClasses}>
            <CopyButton code={code} />
            <Code code={code} />
          </div>
        )}
        {activeKey === 'mixed' && (
          <div className={previewPanelClasses}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="w-full">
                <div className="text-xs text-gray-500 mb-2">示例</div>
                <div className={exampleBoxClasses}>{children}</div>
              </div>
              <div className="w-full">
                <div className="text-xs text-gray-500 mb-2">代码</div>
                <div className="relative">
                  <CopyButton code={code} />
                  <Code code={code} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default DemoBlock
