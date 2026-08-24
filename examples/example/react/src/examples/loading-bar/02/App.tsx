import { Button } from '@expcat/tigercat-react/Button'
import { LoadingBar } from '@expcat/tigercat-react'

export default function App() {
  const simulateError = async () => {
    LoadingBar.start()
    await new Promise((resolve) => window.setTimeout(resolve, 800))
    LoadingBar.error()
  }

  return (
    <Button danger onClick={() => void simulateError()}>
      模拟失败
    </Button>
  )
}
