import { Code } from '@expcat/tigercat-react/Code'

const snippet = `const greeting = 'Hello Tigercat'`

export default function App() {
  return <Code code={snippet} copyLabel="复制代码" />
}
