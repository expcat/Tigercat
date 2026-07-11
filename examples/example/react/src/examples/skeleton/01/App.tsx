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
      <Skeleton />
    </>
  )
}
