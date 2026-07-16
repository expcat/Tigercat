import { useState } from 'react'
import { OrgChart } from '@expcat/tigercat-react/OrgChart'
import type { OrgChartNode } from '@expcat/tigercat-core'

const createAvatar = (initials: string, background: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="${background}"/><text x="32" y="39" text-anchor="middle" font-family="sans-serif" font-size="22" fill="white">${initials}</text></svg>`
  )}`

const data: OrgChartNode = {
  id: 'ceo',
  label: 'Ada Chen',
  title: 'CEO',
  subtitle: '战略与运营',
  avatar: createAvatar('AC', '#2563eb'),
  color: '#2563eb',
  children: [
    {
      id: 'product',
      label: 'Lin Wu',
      title: '产品负责人',
      subtitle: '产品与设计',
      avatar: createAvatar('LW', '#059669'),
      color: '#059669',
      children: [
        {
          id: 'design',
          label: 'Mira Sun',
          title: '设计主管',
          avatar: createAvatar('MS', '#d97706'),
          color: '#d97706'
        }
      ]
    },
    {
      id: 'engineering',
      label: 'Iris Park',
      title: '工程负责人',
      subtitle: '平台与应用',
      avatar: createAvatar('IP', '#7c3aed'),
      color: '#7c3aed',
      children: [
        {
          id: 'platform',
          label: 'Kai Li',
          title: '平台主管',
          avatar: createAvatar('KL', '#dc2626'),
          color: '#dc2626'
        }
      ]
    }
  ]
}

export default function App() {
  const [selectedId, setSelectedId] = useState<string | number | null>('product')

  return (
    <div className="space-y-3 overflow-x-auto">
      <p className="text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
        当前选择：{selectedId ?? '无'}
      </p>
      <OrgChart
        data={data}
        direction="vertical"
        width={760}
        height={500}
        nodeWidth={180}
        showAvatars
        selectable
        selectedId={selectedId}
        onSelectedIdChange={setSelectedId}
        title="团队组织架构"
        desc="纵向布局、头像与受控节点选择"
      />
    </div>
  )
}
