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
      <div
        ref={innerContainerRef}
        className="h-64 overflow-auto rounded-lg border border-gray-200 relative">
        <div className="h-[1000px] p-4">
          <p className="text-gray-600 mb-4">在此容器内向下滚动查看回到顶部按钮。</p>
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i} className="text-gray-400 py-2">
              滚动内容行 {i + 1}
            </p>
          ))}
        </div>
        {innerMounted && innerContainerRef.current && (
          <BackTop
            target={() => innerContainerRef.current!}
            visibilityHeight={100}
            position="fixed"
            placement="bottom-left"
            offset={24}
          />
        )}
      </div>
    </>
  )
}
