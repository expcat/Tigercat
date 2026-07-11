import { Progress } from '@expcat/tigercat-react/Progress'

export default function App() {
  return (
    <Progress
      percentage={64}
      variant="success"
      size="lg"
      striped
      stripedAnimation
      aria-label="任务完成进度"
    />
  )
}
