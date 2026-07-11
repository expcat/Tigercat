import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Progress } from '@expcat/tigercat-react/Progress'

export default function App() {
  const [percentage, setPercentage] = useState(0)

  const startUpload = () => {
    setPercentage(0)
    const timer = window.setInterval(() => {
      setPercentage((value) => {
        const next = Math.min(value + 10, 100)
        if (next === 100) window.clearInterval(timer)
        return next
      })
    }, 200)
  }

  return (
    <div className="space-y-3">
      <Progress percentage={percentage} aria-label="文件上传进度" />
      <Button onClick={startUpload}>开始上传</Button>
    </div>
  )
}
