import { useCallback, useState } from 'react'
import type { TourStep } from '@expcat/tigercat-core'
import { Button } from '@expcat/tigercat-react/Button'
import { Tour } from '@expcat/tigercat-react/Tour'

export default function AsyncTourExample() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(0)
  const [includeOptional, setIncludeOptional] = useState(false)
  const [status, setStatus] = useState('尚未开始')

  const loadSteps = useCallback(async (): Promise<TourStep[]> => {
    return [
      {
        title: '异步加载完成',
        description: '这个居中步骤没有目标元素，并关闭了遮罩。',
        mask: false
      },
      {
        target: '#tour-optional-react',
        title: '条件步骤',
        description: '只有启用可选步骤时才会显示。',
        placement: 'right',
        skipWhen: () => !includeOptional
      },
      {
        target: '#tour-finish-react',
        title: '完成引导',
        description: '步骤支持分别设置目标位置和遮罩。',
        placement: 'top'
      }
    ]
  }, [includeOptional])

  const startTour = () => {
    setCurrent(0)
    setStatus('正在异步加载步骤')
    setOpen(true)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button id="tour-optional-react" onClick={() => setIncludeOptional((value) => !value)}>
          可选步骤：{includeOptional ? '启用' : '跳过'}
        </Button>
        <Button variant="primary" onClick={startTour}>
          启动异步引导
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
