import { useState } from 'react'
import { RichTextEditor } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const sampleHtml = '<p>这是一段<em>只读</em>的富文本内容。</p>'

const basicSnippet = `<RichTextEditor value={content} onChange={setContent} height={250} placeholder="在这里编辑..." />`

const readOnlySnippet = `<RichTextEditor value={html} height={150} readOnly />
<RichTextEditor value={html} height={150} disabled />`

const RichTextEditorDemo: React.FC = () => {
  const [content, setContent] = useState('<p>Hello <strong>Tigercat</strong>!</p>')

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">RichTextEditor 富文本编辑器</h1>
      <p className="text-gray-500 mb-8">所见即所得的富文本编辑器，带工具栏。</p>

      <DemoBlock title="基础用法" description="value + onChange 绑定 HTML" code={basicSnippet}>
        <RichTextEditor value={content} onChange={setContent} height={250} placeholder="在这里编辑..." />
      </DemoBlock>

      <DemoBlock title="只读 & 禁用" code={readOnlySnippet}>
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
      </DemoBlock>
    </div>
  )
}

export default RichTextEditorDemo
