import { useState } from 'react'
import { Tour } from '@expcat/tigercat-react/Tour'

const steps = [
  { target: '#tour-r-btn-1', title: '步骤一', description: '点击此按钮开始引导' },
  { target: '#tour-r-btn-2', title: '步骤二', description: '这是第二个引导目标' },
  { target: '#tour-r-btn-3', title: '步骤三', description: '引导完成！' }
]

const customSteps = [
  { target: '#tour-r-custom', title: '欢迎', description: '自定义按钮文字和指示器' },
  { target: '#tour-r-custom', title: '提示', description: '可以反复定位到同一元素' }
]

export default function App() {
  const [open, setOpen] = useState(false)

  const [open2, setOpen2] = useState(false)

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <div className="flex gap-4 items-center">
            <button
              id="tour-r-btn-1"
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => setOpen(true)}>
              开始引导
            </button>
            <span id="tour-r-btn-2" className="px-3 py-1 bg-gray-100 rounded text-sm">
              目标2
            </span>
            <span id="tour-r-btn-3" className="px-3 py-1 bg-gray-100 rounded text-sm">
              目标3
            </span>
          </div>
          <Tour open={open} steps={steps} onClose={() => setOpen(false)} />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义按钮文字</h3>
          <button
            id="tour-r-custom"
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={() => setOpen2(true)}>
            自定义引导
          </button>
          <Tour
            open={open2}
            steps={customSteps}
            nextText="下一步"
            prevText="上一步"
            finishText="完成"
            showIndicators
            onClose={() => setOpen2(false)}
          />
        </div>
      </div>
    </>
  )
}
