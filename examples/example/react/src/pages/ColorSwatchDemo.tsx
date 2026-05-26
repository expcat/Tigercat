import { useState } from 'react'
import { ColorSwatch, Space, Text } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<ColorSwatch value={color} onChange={setColor} />
<Text>选中颜色: {color}</Text>`

const basicScriptSnippet = `import { useState } from 'react'

const [color, setColor] = useState('#3b82f6')`

const groupSnippet = `<ColorSwatch
  value={brandColor}
  onChange={setBrandColor}
  groups={brandGroups}
  columns={4}
/>

<ColorSwatch
  value={statusColor}
  onChange={setStatusColor}
  colors={[
    { value: '#16a34a', label: 'Success' },
    { value: '#f59e0b', label: 'Warning' },
    { value: '#dc2626', label: 'Danger', disabled: true }
  ]}
/>

<ColorSwatch value="#64748b" size="sm" disabled />`

const brandGroups = [
  {
    label: 'Brand',
    colors: [
      { value: '#0f172a', label: 'Ink' },
      { value: '#2563eb', label: 'Blue' },
      { value: '#0891b2', label: 'Cyan' },
      { value: '#059669', label: 'Green' }
    ]
  },
  {
    label: 'Neutral',
    colors: ['#f8fafc', '#cbd5e1', '#64748b', '#1e293b']
  }
]

const ColorSwatchDemo: React.FC = () => {
  const [color, setColor] = useState('#3b82f6')
  const [brandColor, setBrandColor] = useState('#2563eb')
  const [statusColor, setStatusColor] = useState('#16a34a')

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-2">ColorSwatch 色板选择器</h1>
      <p className="text-gray-500 mb-8">用于从预设色板或自定义色组中快速选择颜色。</p>

      <DemoBlock title="基本用法" code={basicSnippet} script={basicScriptSnippet}>
        <Space size={16} align="center">
          <ColorSwatch value={color} onChange={setColor} />
          <Text>选中颜色: {color}</Text>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="自定义色组"
        description="groups 支持分组标签，colors 支持禁用与自定义无障碍标签。"
        code={groupSnippet}>
        <Space direction="vertical" size={16}>
          <ColorSwatch
            value={brandColor}
            onChange={setBrandColor}
            groups={brandGroups}
            columns={4}
          />
          <ColorSwatch
            value={statusColor}
            onChange={setStatusColor}
            colors={[
              { value: '#16a34a', label: 'Success' },
              { value: '#f59e0b', label: 'Warning' },
              { value: '#dc2626', label: 'Danger', disabled: true }
            ]}
          />
          <Space size={12} align="center">
            <ColorSwatch value="#64748b" size="sm" disabled />
            <Text>禁用状态</Text>
          </Space>
        </Space>
      </DemoBlock>
    </div>
  )
}

export default ColorSwatchDemo
