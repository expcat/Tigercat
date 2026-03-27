import { useState } from 'react'
import { Rate, Space, Text } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `const [val, setVal] = useState(3)
const [halfVal, setHalfVal] = useState(2.5)

<Rate value={val} onChange={setVal} />
<Rate value={halfVal} onChange={setHalfVal} allowHalf />
<Text>当前值: {halfVal}</Text>`

const sizeSnippet = `<Rate value={3} size="sm" disabled />
<Rate value={3} size="md" disabled />
<Rate value={3} size="lg" disabled />`

const customSnippet = `<Rate value={4} onChange={setVal} character="♥" />
<Rate value={4} count={10} disabled />
<Rate value={3} disabled />`

const RateDemo: React.FC = () => {
  const [val, setVal] = useState(3)
  const [halfVal, setHalfVal] = useState(2.5)
  const [customVal, setCustomVal] = useState(4)

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Rate 评分</h1>
      <p className="text-gray-500 mb-8">评分组件，支持半星、自定义字符和禁用状态。</p>

      <DemoBlock title="基本与半星" description="value + onChange 受控，allowHalf 半星" code={basicSnippet}>
        <Space direction="vertical" size={16}>
          <Rate value={val} onChange={setVal} />
          <Rate value={halfVal} onChange={setHalfVal} allowHalf />
          <Text>当前值: {halfVal}</Text>
        </Space>
      </DemoBlock>

      <DemoBlock title="尺寸" description="sm / md / lg 三种尺寸" code={sizeSnippet}>
        <Space direction="vertical" size={12}>
          <Rate value={3} size="sm" disabled />
          <Rate value={3} size="md" disabled />
          <Rate value={3} size="lg" disabled />
        </Space>
      </DemoBlock>

      <DemoBlock title="自定义字符与数量" description="character 自定义图标，count 控制星星数" code={customSnippet}>
        <Space direction="vertical" size={12}>
          <Rate value={customVal} onChange={setCustomVal} character="♥" />
          <Rate value={4} count={10} disabled />
          <Rate value={3} disabled />
        </Space>
      </DemoBlock>
    </div>
  )
}

export default RateDemo
