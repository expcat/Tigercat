import { useState } from 'react'
import { Switch } from '@expcat/tigercat-react/Switch'

export default function App() {
  const [enabled, setEnabled] = useState(true)

  return <Switch checked={enabled} onChange={setEnabled} size="lg" aria-label="启用自动更新" />
}
