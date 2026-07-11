import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Loading } from '@expcat/tigercat-react/Loading'

export default function App() {
  const [loading, setLoading] = useState(false)

  const start = () => {
    setLoading(true)
    window.setTimeout(() => setLoading(false), 1200)
  }

  return (
    <>
      <Button onClick={start}>模拟页面加载</Button>
      {loading ? <Loading fullscreen text="页面加载中…" /> : null}
    </>
  )
}
