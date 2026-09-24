import { WaterfallChart } from '@expcat/tigercat-react/WaterfallChart'
import type { WaterfallDatum } from '@expcat/tigercat-core'

const data: WaterfallDatum[] = [
  { label: 'Open', value: 120, kind: 'total' },
  { label: 'Gain', value: 40, kind: 'increase' },
  { label: 'Loss', value: 25, kind: 'decrease' },
  { label: 'Close', value: 135, kind: 'total' }
]

export default function App() {
  return <WaterfallChart data={data} width={480} height={280} responsive={false} />
}
