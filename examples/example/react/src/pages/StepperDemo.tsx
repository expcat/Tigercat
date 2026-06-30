import { Space } from '@expcat/tigercat-react/Space'
import { Text } from '@expcat/tigercat-react/Text'
import { useState } from 'react'
import { Stepper } from '@expcat/tigercat-react/Stepper'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './StepperDemo.tsx?raw'

const basicScriptSnippet = `import { useState } from 'react'

const [val, setVal] = useState(3)`

const basicSnippet = `<Stepper value={val} onChange={setVal} />
<Stepper value={val} onChange={setVal} min={0} max={10} step={2} />`

const sizeSnippet = `<Stepper value={1} size="sm" />
<Stepper value={1} size="md" />
<Stepper value={1} size="lg" />
<Stepper value={1} disabled />`

const precisionSnippet = `<Stepper value={1.5} step={0.1} precision={2} min={0} max={5} />`

const StepperDemo: React.FC = () => {
  const [val, setVal] = useState(3)

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-2">Stepper 步进器</h1>
      <p className="text-gray-500 mb-8">数值增减控制器，支持步长、范围和精度。</p>

      <DemoBlock
        title="基本用法"
        description="value + onChange 受控，min/max 范围"
        code={fullPageSnippet}>
        <Space direction="vertical" size={12}>
          <Stepper value={val} onChange={setVal} />
          <Stepper value={val} onChange={setVal} min={0} max={10} step={2} />
          <Text>当前值: {val}</Text>
        </Space>
      </DemoBlock>

      <DemoBlock title="尺寸与禁用" description="sm/md/lg 三种尺寸" code={fullPageSnippet}>
        <Space direction="vertical" size={12}>
          <Stepper value={1} size="sm" />
          <Stepper value={1} size="md" />
          <Stepper value={1} size="lg" />
          <Stepper value={1} disabled />
        </Space>
      </DemoBlock>

      <DemoBlock title="小数精度" description="precision 控制小数位数" code={fullPageSnippet}>
        <Stepper value={1.5} step={0.1} precision={2} min={0} max={5} />
      </DemoBlock>
    </div>
  )
}

export default StepperDemo
