import { useState } from 'react'
import { MarkdownEditor } from '@expcat/tigercat-react/MarkdownEditor'
import type {
  MarkdownEditorMode,
  MarkdownRenderer,
  MarkdownToolbarItem
} from '@expcat/tigercat-core'

const initialMarkdown =
  '# Sprint note\n\n> Release candidate is ready.\n\nUse the custom toolbar to mark important text.'

const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

const renderer: MarkdownRenderer = {
  render(markdown) {
    const escaped = markdown.replace(/[&<>"']/g, (character) => htmlEscapes[character])
    return `<h3>自定义预览</h3><pre>${escaped}</pre>`
  }
}

const toolbar: MarkdownToolbarItem[] = [
  { name: 'bold', label: 'B', tooltip: '粗体 (Ctrl+B)', hotkey: 'Ctrl+B' },
  { name: 'italic', label: 'I', tooltip: '斜体 (Ctrl+I)', hotkey: 'Ctrl+I' },
  { type: 'separator' },
  {
    name: 'callout',
    label: '提示',
    tooltip: '插入提示块',
    action: ({ value, selectionStart, selectionEnd }) => {
      const selected = value.slice(selectionStart, selectionEnd) || '需要关注的内容'
      const replacement = `> ${selected}`
      return {
        value: `${value.slice(0, selectionStart)}${replacement}${value.slice(selectionEnd)}`,
        selectionStart: selectionStart + 2,
        selectionEnd: selectionStart + 2 + selected.length
      }
    }
  }
]

export default function App() {
  const [content, setContent] = useState(initialMarkdown)
  const [mode, setMode] = useState<MarkdownEditorMode>('edit')

  return (
    <div className="space-y-3">
      <div className="flex gap-2" role="group" aria-label="编辑器模式">
        {(['edit', 'preview'] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={`rounded px-3 py-1.5 text-sm ${
              mode === item
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 dark:border-gray-600'
            }`}
            aria-pressed={mode === item}
            onClick={() => setMode(item)}>
            {item === 'edit' ? '编辑' : '预览'}
          </button>
        ))}
      </div>

      <MarkdownEditor
        value={content}
        mode={mode}
        toolbar={toolbar}
        renderer={renderer}
        showModeSwitch={false}
        height={300}
        onChange={setContent}
      />
    </div>
  )
}
