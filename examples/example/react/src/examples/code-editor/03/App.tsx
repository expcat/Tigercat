import { CodeEditor } from '@expcat/tigercat-react/CodeEditor'
import { builtinCodeHighlighter } from '@expcat/tigercat-core'

const jsCode = `const release = { version: '2.2.0', ready: true }`

export default function App() {
  return (
    <div className="space-y-2">
      <p className="text-sm text-[var(--tiger-text-muted)]">
        highlighter 可换成 Prism / Shiki 适配器；输出按 TRUSTED HTML 注入。这里显式传入内置引擎。
      </p>
      <CodeEditor
        value={jsCode}
        language="javascript"
        highlighter={builtinCodeHighlighter}
        minLines={4}
        maxLines={8}
        readOnly
      />
    </div>
  )
}
