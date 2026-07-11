import { OrgChart } from '@expcat/tigercat-react/OrgChart'
import type { OrgChartNode } from '@expcat/tigercat-core'

const data: OrgChartNode = {
  id: 'ceo',
  label: 'Ada Chen',
  title: 'Chief Executive Officer',
  color: '#2563eb',
  children: [
    {
      id: 'product',
      label: 'Lin Wu',
      title: 'Product',
      color: '#10b981',
      children: [{ id: 'design', label: 'Mira', title: 'Design Lead', color: '#f59e0b' }]
    },
    {
      id: 'engineering',
      label: 'Iris Park',
      title: 'Engineering',
      color: '#8b5cf6',
      children: [{ id: 'frontend', label: 'Kai', title: 'Frontend', color: '#ef4444' }]
    }
  ]
}

export default function App() {
  return (
    <OrgChart
      data={data}
      direction="horizontal"
      width={760}
      height={360}
      hoverable
      selectable
      title="Organization chart"
      desc="Company reporting structure"
    />
  )
}
