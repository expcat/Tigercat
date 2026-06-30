import { PrintLayout } from '@expcat/tigercat-react/PrintLayout'
import { PrintPageBreak } from '@expcat/tigercat-react/PrintPageBreak'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './PrintLayoutDemo.tsx?raw'

const PrintLayoutDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-2">PrintLayout 打印布局</h1>
      <p className="text-gray-500 mb-8">
        用于预览和打印的页面布局组件，支持 A4/Letter 尺寸、页眉页脚和分页。
      </p>

      <DemoBlock
        title="组合展示"
        description="合并展示基础用法、页眉页脚、横向 & 分页，减少重复示例块。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">默认 A4 纵向布局</p>
            <PrintLayout>
              <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>文档标题</h2>
              <p>这是一段打印内容示例文本。PrintLayout 组件会按照纸张尺寸约束内容宽度。</p>
            </PrintLayout>
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">页眉页脚</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">showHeader / showFooter 开启</p>
            <PrintLayout
              showHeader
              showFooter
              headerText="Tigercat Inc."
              footerText="Confidential — Page 1">
              <p>包含页眉和页脚的打印布局。</p>
            </PrintLayout>
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">横向 & 分页</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              orientation='landscape'，插入 PrintPageBreak
            </p>
            <PrintLayout orientation="landscape" showHeader headerText="横向报告" showPageBreaks>
              <p>第一页内容 — 横向 A4。</p>
              <PrintPageBreak />
              <p>第二页内容 — PrintPageBreak 会插入分页线。</p>
            </PrintLayout>
          </section>
        </div>
      </DemoBlock>
    </div>
  )
}

export default PrintLayoutDemo
