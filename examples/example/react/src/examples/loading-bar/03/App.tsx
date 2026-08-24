import { Button } from '@expcat/tigercat-react/Button'
import { LoadingBar } from '@expcat/tigercat-react'

export default function App() {
  const startCustom = () => {
    LoadingBar.start({
      color: 'success',
      height: 4,
      className: 'demo-loading-bar'
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="primary" onClick={startCustom}>
        自定义颜色与高度
      </Button>
      <Button variant="secondary" onClick={() => LoadingBar.finish()}>
        完成
      </Button>
      <Button onClick={() => LoadingBar.clear()}>立即清除</Button>
    </div>
  )
}
