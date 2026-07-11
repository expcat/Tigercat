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
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">文本 (Text)</h3>
          <Skeleton variant="text" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">头像 (Avatar)</h3>
          <Skeleton variant="avatar" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">图片 (Image)</h3>
          <Skeleton variant="image" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">按钮 (Button)</h3>
          <Skeleton variant="button" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">自定义 (Custom)</h3>
          <Skeleton variant="custom" width="300px" height="150px" />
        </div>
      </div>
    </>
  )
}
