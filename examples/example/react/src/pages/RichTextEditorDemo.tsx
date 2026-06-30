import { useState } from 'react'
import { RichTextEditor } from '@expcat/tigercat-react/RichTextEditor'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './RichTextEditorDemo.tsx?raw'

const sampleHtml = '<p>这是一段<em>只读</em>的富文本内容。</p>'

const RichTextEditorDemo: React.FC = () => {
  const [content, setContent] = useState('<p>Hello <strong>Tigercat</strong>!</p>')

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-2">RichTextEditor 富文本编辑器</h1>
      <p className="text-gray-500 mb-8">所见即所得的富文本编辑器，带工具栏。</p>

      <DemoBlock
        title="组合展示"
        description="合并展示基础用法、只读 & 禁用，减少重复示例块。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">value + onChange 绑定 HTML</p>
            <RichTextEditor
              value={content}
              onChange={setContent}
              height={250}
              placeholder="在这里编辑..."
            />
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">只读 & 禁用</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">只读</p>
                <RichTextEditor value={sampleHtml} height={150} readOnly />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">禁用</p>
                <RichTextEditor value={sampleHtml} height={150} disabled />
              </div>
            </div>
          </section>
        </div>
      </DemoBlock>
    </div>
  )
}

export default RichTextEditorDemo
