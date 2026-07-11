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
      <div className="p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-4">
          通过 <code className="bg-gray-200 px-1 rounded">onClick</code> 监听点击事件。
        </p>
        <Button variant="outline" onClick={handleClick}>
          模拟点击（查看控制台）
        </Button>
      </div>
    </>
  )
}
