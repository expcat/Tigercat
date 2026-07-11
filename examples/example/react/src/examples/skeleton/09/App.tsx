import { Space } from '@expcat/tigercat-react/Space'
import { Card } from '@expcat/tigercat-react/Card'
import { Avatar } from '@expcat/tigercat-react/Avatar'
import { useState, useEffect } from 'react'
import { Skeleton } from '@expcat/tigercat-react/Skeleton'

export default function App() {
  // Loading state simulation
  const [loading, setLoading] = useState(true)

  const [cardLoading, setCardLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading for basic demo
    const timer1 = setTimeout(() => {
      setLoading(false)
    }, 3000)

    // Simulate data loading for card demo
    const timer2 = setTimeout(() => {
      setCardLoading(false)
    }, 3500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <>
      <div className="bg-white p-6 rounded-lg">
        {loading ? (
          <>
            <Skeleton variant="text" width="200px" className="mb-4" />
            <Skeleton variant="text" rows={3} paragraph />
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-4">文章标题</h3>
            <p className="text-gray-700 dark:text-gray-300">
              这是加载完成后显示的内容。骨架屏在内容加载时显示，
              提供更好的用户体验，避免页面空白或突然跳动。
            </p>
          </>
        )}
      </div>
    </>
  )
}
