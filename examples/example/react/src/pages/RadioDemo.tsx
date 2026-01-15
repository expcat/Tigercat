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
  <div>
    <div className="text-sm text-gray-700 mb-2">小号（sm）</div>
    <RadioGroup value={sizeSmValue} onChange={setSizeSmValue} size="sm" className="flex flex-wrap items-center gap-4">
      <Radio value="a">选项 A</Radio>
      <Radio value="b">选项 B</Radio>
      <Radio value="c">选项 C</Radio>
    </RadioGroup>
  </div>
  <div>
    <div className="text-sm text-gray-700 mb-2">默认（md）</div>
    <RadioGroup value={sizeMdValue} onChange={setSizeMdValue} size="md" className="flex flex-wrap items-center gap-4">
      <Radio value="a">选项 A</Radio>
      <Radio value="b">选项 B</Radio>
      <Radio value="c">选项 C</Radio>
    </RadioGroup>
  </div>
  <div>
    <div className="text-sm text-gray-700 mb-2">大号（lg）</div>
    <RadioGroup value={sizeLgValue} onChange={setSizeLgValue} size="lg" className="flex flex-wrap items-center gap-4">
      <Radio value="a">选项 A</Radio>
      <Radio value="b">选项 B</Radio>
      <Radio value="c">选项 C</Radio>
    </RadioGroup>
  </div>
</Space>`

const RadioDemo: React.FC = () => {
  const [basicValue, setBasicValue] = useState<string | number>('male')
  const [uncontrolledValue, setUncontrolledValue] = useState<string | number>('male')
  const [disabledValue, setDisabledValue] = useState<string | number>('medium')
  const [groupDisabledValue, setGroupDisabledValue] = useState<string | number>('a')

  const [sizeSmValue, setSizeSmValue] = useState<string | number>('a')
  const [sizeMdValue, setSizeMdValue] = useState<string | number>('a')
  const [sizeLgValue, setSizeLgValue] = useState<string | number>('a')

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
          <div>
            <div className="text-sm text-gray-700 mb-2">小号（sm）</div>
            <RadioGroup
              value={sizeSmValue}
              onChange={setSizeSmValue}
              size="sm"
              className="flex flex-wrap items-center gap-4">
              <Radio value="a">选项 A</Radio>
              <Radio value="b">选项 B</Radio>
              <Radio value="c">选项 C</Radio>
            </RadioGroup>
          </div>

          <div>
            <div className="text-sm text-gray-700 mb-2">默认（md）</div>
            <RadioGroup
              value={sizeMdValue}
              onChange={setSizeMdValue}
              size="md"
              className="flex flex-wrap items-center gap-4">
              <Radio value="a">选项 A</Radio>
              <Radio value="b">选项 B</Radio>
              <Radio value="c">选项 C</Radio>
            </RadioGroup>
          </div>

          <div>
            <div className="text-sm text-gray-700 mb-2">大号（lg）</div>
            <RadioGroup
              value={sizeLgValue}
              onChange={setSizeLgValue}
              size="lg"
              className="flex flex-wrap items-center gap-4">
              <Radio value="a">选项 A</Radio>
              <Radio value="b">选项 B</Radio>
              <Radio value="c">选项 C</Radio>
            </RadioGroup>
          </div>
        </Space>
      </DemoBlock>
    </div>
  )
}

export default RadioDemo
