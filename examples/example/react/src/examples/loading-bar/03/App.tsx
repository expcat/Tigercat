import { Button } from '@expcat/tigercat-react/Button'
import { LoadingBar } from '@expcat/tigercat-react'

export default function App() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="primary"
        onClick={() =>
          LoadingBar.start({
            color: 'success',
            height: 4,
            className: 'demo-loading-bar'
          })
        }>
        自定义颜色与高度
      </Button>
      <Button variant="secondary" onClick={() => LoadingBar.start()}>
        再次 start 不传选项
      </Button>
      <Button variant="secondary" onClick={() => LoadingBar.set(40)}>
        定到 40%
      </Button>
      <Button variant="secondary" onClick={() => LoadingBar.finish()}>
        完成
      </Button>
      <Button onClick={() => LoadingBar.clear()}>立即清除</Button>
    </div>
  )
}
