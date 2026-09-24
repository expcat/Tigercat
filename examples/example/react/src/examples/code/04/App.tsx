import { Code } from '@expcat/tigercat-react/Code'

const code = 'const alpha = 1\nconst beta = 2'

export default function App() {
  return <Code code={code} language="ts" lineNumbers showLanguage wrapToggle />
}
