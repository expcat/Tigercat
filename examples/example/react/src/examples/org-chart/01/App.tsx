import { OrgChart } from '@expcat/tigercat-react/OrgChart'
import type { OrgChartNode } from '@expcat/tigercat-core'

const data: OrgChartNode = {
  id: 'ceo',
  label: 'Ada Chen',
  title: 'CEO',
  children: [
    {
      id: 'product',
      label: 'Lin Wu',
      title: 'Product',
      children: [{ id: 'design', label: 'Mira', title: 'Design Lead' }]
    },
    {
      id: 'engineering',
      label: 'Iris Park',
      title: 'Engineering',
      children: [{ id: 'frontend', label: 'Kai', title: 'Frontend' }]
    }
  ]
}

export default function App() {
  return <OrgChart data={data} />
}
