import { useState } from 'react'
import { AssigneePicker } from '@expcat/tigercat-react/AssigneePicker'
import type { AssigneeOption } from '@expcat/tigercat-core'

const options: AssigneeOption[] = [
  { id: 'ada', name: 'Ada', department: 'Ops' },
  { id: 'bea', name: 'Bea', department: 'Design' }
]

export default function App() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  return <AssigneePicker options={options} selectedIds={selectedIds} onChange={setSelectedIds} />
}
