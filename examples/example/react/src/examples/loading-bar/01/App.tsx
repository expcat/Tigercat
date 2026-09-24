import { Button } from '@expcat/tigercat-react/Button'
import { LoadingBar } from '@expcat/tigercat-react'
import { LoadingBarContainer } from '@expcat/tigercat-react/LoadingBarContainer'

export default function App() {
  const simulateRequest = async () => {
    LoadingBar.start()
    await new Promise((resolve) => window.setTimeout(resolve, 1200))
    LoadingBar.finish()
  }

  return (
    <div className="space-y-3">
      <Button variant="primary" onClick={() => void simulateRequest()}>
        开始加载
      </Button>
      <LoadingBarContainer percentage={42} status="loading" />
    </div>
  )
}
