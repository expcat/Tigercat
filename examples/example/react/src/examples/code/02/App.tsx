import { Code } from '@expcat/tigercat-react/Code'

const snippet = `function sum(a, b) {
  return a + b
}

sum(2, 3) // 5`

export default function App() {
  return (
    <div className="space-y-4">
      <Code code={snippet} copyLabel="复制" />
      <Code code="npm i @expcat/tigercat-react" copyable={false} />
    </div>
  )
}
