import { useEffect, useRef, useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Progress } from '@expcat/tigercat-react/Progress'

export default function App() {
  const [percentage, setPercentage] = useState(0)
  const timerRef = useRef<number | null>(null)

  const startUpload = () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current)
    setPercentage(0)
    timerRef.current = window.setInterval(() => {
      setPercentage((value) => {
        const next = Math.min(value + 10, 100)
        if (next === 100 && timerRef.current !== null) {
          window.clearInterval(timerRef.current)
          timerRef.current = null
        }
        return next
      })
    }, 200)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current)
    }
  }, [])

  return (
    <div className="space-y-3">
      <Progress percentage={percentage} />
      <Progress percentage={40} status="paused" striped stripedAnimation />
      <Button onClick={startUpload}>开始上传</Button>
    </div>
  )
}
