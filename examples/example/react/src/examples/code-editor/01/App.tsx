import { useState } from 'react'
import { CodeEditor } from '@expcat/tigercat-react/CodeEditor'

const initialCode = "function greet(name) {\n  return 'Hello, ' + name\n}"

export default function App() {
  const [code, setCode] = useState(initialCode)

  return (
    <CodeEditor
      value={code}
      onChange={setCode}
      language="javascript"
      theme="dark"
      tabSize={2}
      wordWrap
      minLines={6}
      maxLines={12}
    />
  )
}
