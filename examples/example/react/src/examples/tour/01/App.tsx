import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Tour } from '@expcat/tigercat-react/Tour'

const steps = [
  { target: '#tour-start-react', title: '开始', description: '从这里启动操作。' },
  { target: '#tour-result-react', title: '结果', description: '在这里查看结果。' }
]

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-4">
      <Button id="tour-start-react" onClick={() => setOpen(true)}>
        开始引导
      </Button>
      <span id="tour-result-react" className="rounded bg-gray-100 px-3 py-2">
        结果区域
      </span>
      <Tour
        open={open}
        steps={steps}
        nextText="下一步"
        prevText="上一步"
        finishText="完成"
        showIndicators
        onOpenChange={setOpen}
      />
    </div>
  )
}
