import React, { useState } from 'react'
import { Tabs, TabPane, Code } from '@expcat/tigercat-react'

interface DemoBlockProps {
  title: string
  description?: string
  code: string
  children: React.ReactNode
}

const panelBaseClasses =
  'rounded-b-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/40'
const previewPanelClasses = `p-6 ${panelBaseClasses}`
const codePanelClasses = `p-4 ${panelBaseClasses}`
const exampleBoxClasses =
  'rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900'

const DemoBlock: React.FC<DemoBlockProps> = ({ title, description, code, children }) => {
  const [activeKey, setActiveKey] = useState('preview')

  return (
    <section className="mb-12">
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
                <Code code={code} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default DemoBlock
