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
      <Space direction="vertical" size={16} className="w-full">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">自定义宽度</h3>
          <Skeleton width="200px" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">自定义高度</h3>
          <Skeleton height="50px" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">同时自定义宽高</h3>
          <Skeleton width="300px" height="100px" />
        </div>
      </Space>
    </>
  )
}
