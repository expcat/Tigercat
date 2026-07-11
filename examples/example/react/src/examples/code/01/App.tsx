import { useState } from 'react'
import { Code } from '@expcat/tigercat-react/Code'

const fullPageSnippet = `const greeting = 'Hello Tigercat'`

export default function App() {
  const [lastCopied, setLastCopied] = useState('')

  return (
    <>
      <Code code={fullPageSnippet} />
    </>
  )
}
