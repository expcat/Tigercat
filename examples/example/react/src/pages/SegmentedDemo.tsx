import { Space } from '@expcat/tigercat-react/Space'
import { Text } from '@expcat/tigercat-react/Text'
import { useState } from 'react'
import { Segmented } from '@expcat/tigercat-react/Segmented'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './SegmentedDemo.tsx?raw'

const simpleOpts = [
  { label: '选项 A', value: 'a' },
  { label: '选项 B', value: 'b' },
  { label: '选项 C', value: 'c' }
]

const basicSnippet = `<Segmented
  value={selected}
  onChange={setSelected}
  options={[
    { label: '日', value: 'daily' },
    { label: '周', value: 'weekly' },
    { label: '月', value: 'monthly' },
    { label: '年', value: 'yearly' }
  ]}
/>`

const basicScriptSnippet = `import { useState } from 'react'

const [selected, setSelected] = useState('daily')`

const sizeSnippet = `<Segmented size="sm" options={options} value="a" />
<Segmented size="md" options={options} value="a" />
<Segmented size="lg" options={options} value="a" />
<Segmented block options={options} value="a" />`

const disabledSnippet = `<Segmented
  options={[
    { label: '可选A', value: 'a' },
    { label: '禁用B', value: 'b', disabled: true },
    { label: '可选C', value: 'c' }
  ]}
  value="a"
/>
<Segmented disabled options={options} value="a" />`

const SegmentedDemo: React.FC = () => {
  const [selected, setSelected] = useState<string | number>('daily')

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-2">Segmented 分段控制器</h1>
      <p className="text-gray-500 mb-8">分段选择器，类似 iOS UISegmentedControl。</p>

      <DemoBlock title="基本用法" description="value + onChange 受控" code={fullPageSnippet}>
        <Space direction="vertical" size={12}>
          <Segmented
            value={selected}
            onChange={setSelected}
            options={[
              { label: '日', value: 'daily' },
              { label: '周', value: 'weekly' },
              { label: '月', value: 'monthly' },
              { label: '年', value: 'yearly' }
            ]}
          />
          <Text>当前选中: {String(selected)}</Text>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="尺寸与通栏"
        description="sm/md/lg 尺寸，block 撑满宽度"
        code={fullPageSnippet}>
        <Space direction="vertical" size={12} className="w-full">
          <Segmented size="sm" options={simpleOpts} value="a" />
          <Segmented size="md" options={simpleOpts} value="a" />
          <Segmented size="lg" options={simpleOpts} value="a" />
          <Segmented block options={simpleOpts} value="a" />
        </Space>
      </DemoBlock>

      <DemoBlock title="禁用" description="整体禁用 或 单个选项禁用" code={fullPageSnippet}>
        <Space direction="vertical" size={12}>
          <Segmented
            options={[
              { label: '可选A', value: 'a' },
              { label: '禁用B', value: 'b', disabled: true },
              { label: '可选C', value: 'c' }
            ]}
            value="a"
          />
          <Segmented disabled options={simpleOpts} value="a" />
        </Space>
      </DemoBlock>
    </div>
  )
}

export default SegmentedDemo
