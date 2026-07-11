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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cardLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <div className="flex items-start gap-4">
                  <Skeleton variant="avatar" shape="square" />
                  <div className="flex-1">
                    <Skeleton variant="text" width="120px" className="mb-2" />
                    <Skeleton variant="text" rows={2} paragraph />
                  </div>
                </div>
              </Card>
            ))}
          </>
        ) : (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <div className="flex items-start gap-4">
                  <Avatar shape="square" text="Item" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Item {i}</h4>
                    <p className="text-sm text-gray-600">骨架屏结束后显示的内容。</p>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
    </>
  )
}
