import { Progress } from '@expcat/tigercat-react/Progress'

export default function App() {
  return (
    <div className="space-y-3">
      <Progress percentage={32} size="sm" />
      <Progress percentage={64} />
      <Progress percentage={88} variant="success" size="lg" striped stripedAnimation />
    </div>
  )
}
