import { Button } from '@expcat/tigercat-react/Button'
import { useState, useEffect, useRef } from 'react'
import { BackTop } from '@expcat/tigercat-react/BackTop'

export default function App() {
  const [pageScrollContainer, setPageScrollContainer] = useState<HTMLElement | null>(null)

  const innerContainerRef = useRef<HTMLDivElement>(null)

  const [innerMounted, setInnerMounted] = useState(false)

  useEffect(() => {
    const container = document.querySelector('main > div.overflow-y-auto') as HTMLElement
    setPageScrollContainer(container)
    setInnerMounted(true)
  }, [])

  const handleClick = () => {
    console.log('BackTop clicked!')
  }

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">
              向下滚动页面超过 400px 后，右下角会出现回到顶部按钮。
            </p>
            <p className="text-sm text-gray-500">
              提示：本页面已添加 BackTop 组件，请向下滚动查看效果。
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义显示高度</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              通过 <code className="bg-gray-200 px-1 rounded">visibilityHeight</code>{' '}
              属性设置滚动高度阈值。
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义内容</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">通过 children 自定义按钮内容。</p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-lg">
                UP
              </div>
              <span className="text-sm text-gray-500">← 示例：自定义的回到顶部按钮样式</span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义动画时长</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              通过 <code className="bg-gray-200 px-1 rounded">duration</code>{' '}
              属性设置动画时长（毫秒），默认 450ms。
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
