import { SankeyChart } from '@expcat/tigercat-react/SankeyChart'
import type { SankeyLink, SankeyNode } from '@expcat/tigercat-core'

const nodes: SankeyNode[] = [
  { id: 'source', label: 'Source' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' }
]
const links: SankeyLink[] = [
  { source: 'source', target: 'left', value: 8 },
  { source: 'source', target: 'right', value: 5 }
]

export default function App() {
  return <SankeyChart nodes={nodes} links={links} width={480} height={280} responsive={false} />
}
