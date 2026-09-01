import { CodeEditor } from '@expcat/tigercat-react/CodeEditor'

const jsCode = `const release = {
  version: '2.0.4',
  ready: true
}`

const htmlCode = `<div class="card">
  <h1>Release</h1>
</div>`

export default function App() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="space-y-2">
        <h3 className="text-sm font-medium">只读代码</h3>
        <p className="text-xs text-gray-500">可以选择和复制。Tab 会离开焦点，不会改只读内容。</p>
        <CodeEditor value={jsCode} language="javascript" minLines={6} maxLines={8} readOnly />
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-medium">HTML 高亮</h3>
        <p className="text-xs text-gray-500">禁用状态不接受聚焦或输入。</p>
        <CodeEditor value={htmlCode} language="html" minLines={6} maxLines={8} disabled />
      </section>
    </div>
  )
}
