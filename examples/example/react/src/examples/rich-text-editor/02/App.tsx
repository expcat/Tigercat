import { useState } from 'react'
import { RichTextEditor } from '@expcat/tigercat-react/RichTextEditor'
import type { ToolbarItem } from '@expcat/tigercat-core'

const initialContent =
  '<h2>Release note</h2><p>Tigercat v2 示例覆盖正在持续完善。</p><ul><li>保持 React / Vue 对等</li><li>每个状态都可独立查看</li></ul>'

const compactToolbar: ToolbarItem[] = [
  { name: 'heading2', label: 'H2', tooltip: '二级标题' },
  { type: 'separator' },
  { name: 'bold', label: 'B', tooltip: '粗体', hotkey: 'Ctrl+B' },
  { name: 'italic', label: 'I', tooltip: '斜体', hotkey: 'Ctrl+I' },
  { name: 'underline', label: 'U', tooltip: '下划线', hotkey: 'Ctrl+U' },
  { type: 'separator' },
  { name: 'bulletList', label: '列表', tooltip: '无序列表' },
  { name: 'clear', label: '清除', tooltip: '清除格式' }
]

export default function App() {
  const [content, setContent] = useState(initialContent)

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <h3 className="text-sm font-medium">自定义工具栏</h3>
        <RichTextEditor
          value={content}
          toolbar={compactToolbar}
          height={220}
          placeholder="编写发布说明..."
          onChange={setContent}
        />
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-2">
          <h3 className="text-sm font-medium">只读内容</h3>
          <RichTextEditor value={initialContent} toolbar={compactToolbar} height={180} readOnly />
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-medium">禁用编辑器</h3>
          <RichTextEditor value={initialContent} toolbar={compactToolbar} height={180} disabled />
        </section>
      </div>
    </div>
  )
}
