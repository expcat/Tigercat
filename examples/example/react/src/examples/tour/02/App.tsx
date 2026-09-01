import { useCallback, useRef, useState } from 'react'
import type { TourStep } from '@expcat/tigercat-core'
import { Button } from '@expcat/tigercat-react/Button'
import { Tour } from '@expcat/tigercat-react/Tour'

export default function AsyncTourExample() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(0)
  const [includeOptional, setIncludeOptional] = useState(false)
  const [status, setStatus] = useState('尚未开始')
  const includeOptionalRef = useRef(includeOptional)
  includeOptionalRef.current = includeOptional

  const loadSteps = useCallback(async (): Promise<TourStep[]> => {
    return [
      {
        target: '#tour-start-async-react',
        title: '异步加载完成',
        description: '第一步也有目标，打开后会挖洞而不是居中。'
      },
      {
        target: '#tour-optional-react',
        title: '条件步骤',
        description: '只有启用可选步骤时才会显示。',
        placement: 'right',
        skipWhen: () => !includeOptionalRef.current
      },
      {
        target: '#tour-finish-react',
        title: '完成引导',
        description: 'closable={false} 只藏关闭钮，Esc 和点遮罩仍会关掉。',
        placement: 'top'
      }
    ]
  }, [])

  const startTour = () => {
    setCurrent(0)
    setStatus('正在异步加载步骤')
    setOpen(true)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button id="tour-start-async-react" variant="primary" onClick={startTour}>
          启动异步引导
        </Button>
        <Button id="tour-optional-react" onClick={() => setIncludeOptional((value) => !value)}>
          可选步骤：{includeOptional ? '启用' : '跳过'}
        </Button>
        <span id="tour-finish-react" className="rounded bg-gray-100 px-3 py-2">
          最终目标
        </span>
      </div>
      <p role="status" className="text-sm text-gray-500">
        {status}
      </p>
      <Tour
        steps={[]}
        loadSteps={loadSteps}
        open={open}
        current={current}
        closable={false}
        onOpenChange={setOpen}
        onChange={(nextCurrent) => {
          setCurrent(nextCurrent)
          setStatus(`当前原始步骤索引：${nextCurrent}`)
        }}
        onFinish={() => setStatus('引导已完成')}
      />
    </div>
  )
}
