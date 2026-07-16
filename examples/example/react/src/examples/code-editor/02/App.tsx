import { CodeEditor } from '@expcat/tigercat-react/CodeEditor'

const code = `const release = {
  version: '2.0.4',
  ready: true
}`

export default function App() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="space-y-2">
        <h3 className="text-sm font-medium">只读代码</h3>
        <p className="text-xs text-gray-500">可以选择和复制内容，但不能修改。</p>
        <CodeEditor value={code} language="javascript" minLines={6} maxLines={8} readOnly />
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-medium">禁用编辑器</h3>
        <p className="text-xs text-gray-500">禁用状态不接受聚焦或输入。</p>
        <CodeEditor
          value={code}
          language="javascript"
          theme="dark"
          minLines={6}
          maxLines={8}
          disabled
        />
      </section>
    </div>
  )
}
