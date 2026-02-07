import React, { useState } from 'react'
import { Radio, RadioGroup, Space } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Space direction="vertical">
  <RadioGroup value={basicValue} onChange={setBasicValue} className="flex flex-wrap items-center gap-4">
    <Radio value="male">男</Radio>
    <Radio value="female">女</Radio>
    <Radio value="other">其他</Radio>
  </RadioGroup>
  <p className="text-sm text-gray-600">当前选中：{String(basicValue)}</p>
</Space>`

const standaloneSnippet = `<Space direction="vertical">
  <Radio value="agree" checked={agreed} onChange={() => setAgreed(true)}>同意用户协议</Radio>
  <Radio value="standalone" defaultChecked>默认选中的独立选项</Radio>
</Space>`

const uncontrolledSnippet = `<Space direction="vertical">
  <RadioGroup defaultValue="male" onChange={setUncontrolledValue} className="flex flex-wrap items-center gap-4">
    <Radio value="male">男</Radio>
    <Radio value="female">女</Radio>
    <Radio value="other">其他</Radio>
  </RadioGroup>
  <p className="text-sm text-gray-600">最近一次变更：{String(uncontrolledValue)}</p>
</Space>`

const disabledSnippet = `<Space direction="vertical">
  <div>
    <div className="text-sm text-gray-700 mb-2">部分禁用</div>
    <RadioGroup value={disabledValue} onChange={setDisabledValue} className="flex flex-wrap items-center gap-4">
      <Radio value="small">小</Radio>
      <Radio value="medium">中</Radio>
      <Radio value="large" disabled>大（禁用）</Radio>
    </RadioGroup>
  </div>
  <div>
    <div className="text-sm text-gray-700 mb-2">整组禁用</div>
    <RadioGroup value={groupDisabledValue} onChange={setGroupDisabledValue} disabled className="flex flex-wrap items-center gap-4">
      <Radio value="a">选项 A</Radio>
      <Radio value="b">选项 B</Radio>
      <Radio value="c">选项 C</Radio>
    </RadioGroup>
  </div>
</Space>`

const sizeSnippet = `<Space direction="vertical">
  {(['sm', 'md', 'lg'] as const).map(size => (
    <div key={size}>
      <div className="text-sm text-gray-700 mb-2">{size}</div>
      <RadioGroup value={sizeValues[size]} onChange={v => setSizeValues(s => ({ ...s, [size]: v }))} size={size} className="flex flex-wrap items-center gap-4">
        <Radio value="a">选项 A</Radio>
        <Radio value="b">选项 B</Radio>
        <Radio value="c">选项 C</Radio>
      </RadioGroup>
    </div>
  ))}
</Space>`

const numericSnippet = `<Space direction="vertical">
  <RadioGroup value={numericValue} onChange={setNumericValue} className="flex flex-wrap items-center gap-4">
    <Radio value={1}>选项 1</Radio>
    <Radio value={2}>选项 2</Radio>
    <Radio value={3}>选项 3</Radio>
  </RadioGroup>
  <p className="text-sm text-gray-600">当前值：{String(numericValue)}（类型：{typeof numericValue}）</p>
</Space>`

const customSnippet = `<RadioGroup
  value={customValue}
  onChange={setCustomValue}
  className="flex flex-wrap items-center gap-6"
  name="custom-radio"
>
  <Radio value="a" className="bg-blue-50 px-3 py-1 rounded">选项 A</Radio>
  <Radio value="b" className="bg-green-50 px-3 py-1 rounded">选项 B</Radio>
</RadioGroup>`

const RadioDemo: React.FC = () => {
  const [basicValue, setBasicValue] = useState<string | number>('male')
  const [agreed, setAgreed] = useState(false)
  const [uncontrolledValue, setUncontrolledValue] = useState<string | number>('male')
  const [disabledValue, setDisabledValue] = useState<string | number>('medium')
  const [groupDisabledValue, setGroupDisabledValue] = useState<string | number>('a')
  const [sizeValues, setSizeValues] = useState<Record<string, string | number>>({
    sm: 'a',
    md: 'a',
    lg: 'a'
  })
  const [numericValue, setNumericValue] = useState<string | number>(1)
  const [customValue, setCustomValue] = useState<string | number>('a')

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Radio 单选框</h1>
        <p className="text-gray-600">在一组备选项中进行单选。</p>
      </div>

      {/* 基础用法 */}
      <DemoBlock
        title="基础用法"
        description="单选框组合使用时，需要通过 RadioGroup 组件进行包裹。"
        code={basicSnippet}>
        <Space direction="vertical">
          <RadioGroup
            value={basicValue}
            onChange={setBasicValue}
            className="flex flex-wrap items-center gap-4">
            <Radio value="male">男</Radio>
            <Radio value="female">女</Radio>
            <Radio value="other">其他</Radio>
          </RadioGroup>
          <p className="text-sm text-gray-600">当前选中：{String(basicValue)}</p>
        </Space>
      </DemoBlock>

      {/* 单独使用 */}
      <DemoBlock
        title="单独使用"
        description="Radio 可以脱离 RadioGroup 单独使用，支持受控和非受控两种模式。"
        code={standaloneSnippet}>
        <Space direction="vertical">
          <Radio value="agree" checked={agreed} onChange={() => setAgreed(true)}>
            同意用户协议
          </Radio>
          <Radio value="standalone" defaultChecked>
            默认选中的独立选项
          </Radio>
        </Space>
      </DemoBlock>

      {/* 非受控 */}
      <DemoBlock
        title="非受控"
        description="不传 value，仅使用 defaultValue，并通过 onChange 监听变化。"
        code={uncontrolledSnippet}>
        <Space direction="vertical">
          <RadioGroup
            defaultValue="male"
            onChange={setUncontrolledValue}
            className="flex flex-wrap items-center gap-4">
            <Radio value="male">男</Radio>
            <Radio value="female">女</Radio>
            <Radio value="other">其他</Radio>
          </RadioGroup>
          <p className="text-sm text-gray-600">最近一次变更：{String(uncontrolledValue)}</p>
        </Space>
      </DemoBlock>

      {/* 禁用状态 */}
      <DemoBlock title="禁用状态" description="单选框不可用的状态。" code={disabledSnippet}>
        <Space direction="vertical">
          <div>
            <div className="text-sm text-gray-700 mb-2">部分禁用</div>
            <RadioGroup
              value={disabledValue}
              onChange={setDisabledValue}
              className="flex flex-wrap items-center gap-4">
              <Radio value="small">小</Radio>
              <Radio value="medium">中</Radio>
              <Radio value="large" disabled>
                大（禁用）
              </Radio>
            </RadioGroup>
          </div>

          <div>
            <div className="text-sm text-gray-700 mb-2">整组禁用</div>
            <RadioGroup
              value={groupDisabledValue}
              onChange={setGroupDisabledValue}
              disabled
              className="flex flex-wrap items-center gap-4">
              <Radio value="a">选项 A</Radio>
              <Radio value="b">选项 B</Radio>
              <Radio value="c">选项 C</Radio>
            </RadioGroup>
          </div>
        </Space>
      </DemoBlock>

      {/* 尺寸 */}
      <DemoBlock
        title="尺寸"
        description="通过 RadioGroup 的 size 控制整组尺寸。"
        code={sizeSnippet}>
        <Space direction="vertical">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size}>
              <div className="text-sm text-gray-700 mb-2">{size}</div>
              <RadioGroup
                value={sizeValues[size]}
                onChange={(v) => setSizeValues((s) => ({ ...s, [size]: v }))}
                size={size}
                className="flex flex-wrap items-center gap-4">
                <Radio value="a">选项 A</Radio>
                <Radio value="b">选项 B</Radio>
                <Radio value="c">选项 C</Radio>
              </RadioGroup>
            </div>
          ))}
        </Space>
      </DemoBlock>

      {/* 数字值 */}
      <DemoBlock
        title="数字值"
        description="Radio 的 value 支持 number 类型。"
        code={numericSnippet}>
        <Space direction="vertical">
          <RadioGroup
            value={numericValue}
            onChange={setNumericValue}
            className="flex flex-wrap items-center gap-4">
            <Radio value={1}>选项 1</Radio>
            <Radio value={2}>选项 2</Radio>
            <Radio value={3}>选项 3</Radio>
          </RadioGroup>
          <p className="text-sm text-gray-600">
            当前值：{String(numericValue)}（类型：{typeof numericValue}）
          </p>
        </Space>
      </DemoBlock>

      {/* 自定义样式 */}
      <DemoBlock
        title="自定义样式"
        description="通过 className 和 name 自定义 Radio 和 RadioGroup 的外观与分组。"
        code={customSnippet}>
        <RadioGroup
          value={customValue}
          onChange={setCustomValue}
          className="flex flex-wrap items-center gap-6"
          name="custom-radio">
          <Radio value="a" className="bg-blue-50 px-3 py-1 rounded">
            选项 A
          </Radio>
          <Radio value="b" className="bg-green-50 px-3 py-1 rounded">
            选项 B
          </Radio>
        </RadioGroup>
      </DemoBlock>
    </div>
  )
}

export default RadioDemo
