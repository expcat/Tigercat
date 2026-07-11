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
      <Space direction="vertical" size={24} className="w-full">
        <div className="bg-white p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">文章预览</h3>
          <div className="flex items-start gap-4">
            <Skeleton variant="avatar" shape="circle" />
            <div className="flex-1">
              <Skeleton variant="text" width="150px" className="mb-2" />
              <Skeleton variant="text" rows={2} paragraph />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">图片卡片</h3>
          <Skeleton variant="image" className="mb-4" />
          <Skeleton variant="text" rows={2} paragraph className="mb-3" />
          <Skeleton variant="button" />
        </div>
      </Space>
    </>
  )
}
