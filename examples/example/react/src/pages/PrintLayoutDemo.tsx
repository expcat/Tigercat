import { PrintLayout, PrintPageBreak } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<PrintLayout>
  <h2>文档标题</h2>
  <p>打印内容...</p>
</PrintLayout>`

const headerFooterSnippet = `<PrintLayout showHeader showFooter headerText="Tigercat Inc." footerText="Confidential — Page 1">
  <p>内容...</p>
</PrintLayout>`

const landscapeSnippet = `<PrintLayout orientation="landscape" showHeader headerText="横向报告" showPageBreaks>
  <p>第一页内容</p>
  <PrintPageBreak />
  <p>第二页内容</p>
</PrintLayout>`

const PrintLayoutDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">PrintLayout 打印布局</h1>
      <p className="text-gray-500 mb-8">用于预览和打印的页面布局组件，支持 A4/Letter 尺寸、页眉页脚和分页。</p>

      <DemoBlock title="基础用法" description="默认 A4 纵向布局" code={basicSnippet}>
        <PrintLayout>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>文档标题</h2>
          <p>这是一段打印内容示例文本。PrintLayout 组件会按照纸张尺寸约束内容宽度。</p>
        </PrintLayout>
      </DemoBlock>

      <DemoBlock title="页眉页脚" description="showHeader / showFooter 开启" code={headerFooterSnippet}>
        <PrintLayout showHeader showFooter headerText="Tigercat Inc." footerText="Confidential — Page 1">
          <p>包含页眉和页脚的打印布局。</p>
        </PrintLayout>
      </DemoBlock>

      <DemoBlock title="横向 & 分页" description="orientation='landscape'，插入 PrintPageBreak" code={landscapeSnippet}>
        <PrintLayout orientation="landscape" showHeader headerText="横向报告" showPageBreaks>
          <p>第一页内容 — 横向 A4。</p>
          <PrintPageBreak />
          <p>第二页内容 — PrintPageBreak 会插入分页线。</p>
        </PrintLayout>
      </DemoBlock>
    </div>
  )
}

export default PrintLayoutDemo
