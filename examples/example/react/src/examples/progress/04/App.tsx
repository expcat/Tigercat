import { Progress } from '@expcat/tigercat-react/Progress'

export default function App() {
  return (
    <div className="space-y-3">
      <Progress percentage={40} status="success" />
      <Progress percentage={40} indeterminate />
      <Progress percentage={50} steps={4} />
    </div>
  )
}
