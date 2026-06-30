import { useMemo, useState } from 'react'
import { MarkdownEditor } from '@expcat/tigercat-react/MarkdownEditor'

const initialMarkdown = `# Release notes

Tigercat now supports **Markdown editing** with live preview.

- Edit content
- Switch preview modes
- Extend rendering`

const readOnlyMarkdown = `## Component brief

Use split mode while drafting, then switch to preview before publishing.`

export default function MarkdownEditorDemoFixture() {
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
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
        <MarkdownEditor value={content} onChange={setContent} height={360} />
      </section>
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">模式切换</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <MarkdownEditor value={readOnlyMarkdown} mode="preview" height={220} readOnly />
          <MarkdownEditor defaultValue={readOnlyMarkdown} defaultMode="edit" height={220} />
        </div>
      </section>
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">扩展渲染器</h3>
        <MarkdownEditor value={content} renderer={renderer} mode="preview" height={180} />
      </section>
    </div>
  )
}
