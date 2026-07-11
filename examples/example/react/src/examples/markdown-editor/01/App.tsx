import { useMemo, useState } from 'react'
import { MarkdownEditor } from '@expcat/tigercat-react/MarkdownEditor'

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

export default function App() {
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
    <>
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">value + onChange 绑定 Markdown</p>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            height={360}
            placeholder="Write markdown..."
          />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">模式切换</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">edit / split / preview</p>
          <div className="grid gap-4 md:grid-cols-2">
            <MarkdownEditor value={readOnlyMarkdown} mode="preview" height={220} readOnly />
            <MarkdownEditor defaultValue={readOnlyMarkdown} defaultMode="edit" height={220} />
          </div>
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">扩展渲染器</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            renderer 接管预览 HTML，组件仍会清理危险内容
          </p>
          <MarkdownEditor value={content} renderer={renderer} mode="preview" height={180} />
        </section>
      </div>
    </>
  )
}
