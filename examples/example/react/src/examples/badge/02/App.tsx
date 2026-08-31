import { Badge } from '@expcat/tigercat-react/Badge'

export default function App() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge type="text" content="NEW" variant="success" />
      <Badge type="text" content={150} max={99} variant="info" />
    </div>
  )
}
