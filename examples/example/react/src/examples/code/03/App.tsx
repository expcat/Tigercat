import { Code } from '@expcat/tigercat-react/Code'
import type { CodeHighlighter } from '@expcat/tigercat-core'

const json = `{ "ok": true, "count": 2 }`

const highlighter: CodeHighlighter = {
  name: 'demo',
  highlightCode(code, language) {
    return code.split('\n').map((line) => [{ text: line, className: `lang-${language}` }])
  }
}

export default function App() {
  return <Code code={json} language="json" highlighter={highlighter} />
}
