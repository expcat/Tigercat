import { Button } from '@expcat/tigercat-react/Button'
import { LoadingBar } from '@expcat/tigercat-react'

export default function App() {
  const simulateRequest = async () => {
    LoadingBar.start()
    await new Promise((resolve) => window.setTimeout(resolve, 1200))
    LoadingBar.finish()
  }

  return (
    <Button variant="primary" onClick={() => void simulateRequest()}>
      开始加载
    </Button>
  )
}
