import { useMemo, useState } from 'react'
import { MarkdownEditor } from '@expcat/tigercat-react/MarkdownEditor'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './MarkdownEditorDemo.tsx?raw'

const initialMarkdown = `# Release notes

Tigercat now supports **Markdown editing** with live preview.

- Edit content
- Switch preview modes
- Extend rendering

| Area | Status |
| --- | --- |
| Vue | Ready |
| React | Ready |`

const readOnlyMarkdown = `## Component brief

Use split mode while drafting, then switch to preview before publishing.

> Custom renderers are sanitized before preview output.`

const basicSnippet = `<MarkdownEditor value={content} onChange={setContent} height={360} placeholder="Write markdown..." />`

const modeSnippet = `<MarkdownEditor value={markdown} mode="preview" height={220} readOnly />
<MarkdownEditor value={markdown} defaultMode="edit" height={220} />`

const rendererSnippet = `<MarkdownEditor value={content} renderer={renderer} mode="preview" height={180} />`

const scriptSnippet = `const [content, setContent] = useState(initialMarkdown)`

const MarkdownEditorDemo: React.FC = () => {
  const [content, setContent] = useState(initialMarkdown)
  const renderer = useMemo(
    () => ({
      render(markdown: string) {
        return `<p><strong>Custom renderer:</strong> ${markdown.split('\n')[0]}</p>`
      }
    }),
    []
  )

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-2">MarkdownEditor Markdown 编辑器</h1>
      <p className="text-gray-500 mb-8">支持编辑、分屏预览、工具栏插入和自定义预览渲染。</p>

      <DemoBlock
        title="基础用法"
        description="value + onChange 绑定 Markdown"
        code={fullPageSnippet}>
        <MarkdownEditor
          value={content}
          onChange={setContent}
          height={360}
          placeholder="Write markdown..."
        />
      </DemoBlock>

      <DemoBlock title="模式切换" description="edit / split / preview" code={fullPageSnippet}>
        <div className="grid gap-4 md:grid-cols-2">
          <MarkdownEditor value={readOnlyMarkdown} mode="preview" height={220} readOnly />
          <MarkdownEditor defaultValue={readOnlyMarkdown} defaultMode="edit" height={220} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="扩展渲染器"
        description="renderer 接管预览 HTML，组件仍会清理危险内容"
        code={fullPageSnippet}>
        <MarkdownEditor value={content} renderer={renderer} mode="preview" height={180} />
      </DemoBlock>
    </div>
  )
}

export default MarkdownEditorDemo
