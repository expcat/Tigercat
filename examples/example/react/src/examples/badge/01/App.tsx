import { Badge } from '@expcat/tigercat-react/Badge'

export default function App() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge content={12} max={9} size="lg" variant="danger" />
      <Badge content={0} showZero />
      <Badge type="dot" />
    </div>
  )
}
