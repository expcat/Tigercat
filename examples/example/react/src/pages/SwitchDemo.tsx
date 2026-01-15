import React, { useState } from 'react'
import { Switch, Space } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Space direction="vertical">
  <div className="flex items-center gap-3">
    <Switch checked={basicEnabled} onChange={setBasicEnabled} />
    <span className="text-sm text-gray-600">{basicEnabled ? '开启' : '关闭'}</span>
  </div>
</Space>`

const disabledSnippet = `<Space>
  <Switch checked={disabledOn} disabled />
  <Switch checked={disabledOff} disabled />
</Space>`

const sizeSnippet = `<Space align="center">
  <Switch checked={sizeSm} size="sm" onChange={setSizeSm} />
  <Switch checked={sizeMd} size="md" onChange={setSizeMd} />
  <Switch checked={sizeLg} size="lg" onChange={setSizeLg} />
</Space>`

const SwitchDemo: React.FC = () => {
  const [basicEnabled, setBasicEnabled] = useState(true)

  const disabledOn = true
  const disabledOff = false

  const [sizeSm, setSizeSm] = useState(false)
  const [sizeMd, setSizeMd] = useState(true)
  const [sizeLg, setSizeLg] = useState(false)

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Switch 开关</h1>
        <p className="text-gray-600">表示两种相互对立的状态间的切换，多用于触发「开/关」。</p>
      </div>

      {/* 基础用法 */}
      <DemoBlock title="基础用法" description="绑定到一个 Boolean 类型的变量。" code={basicSnippet}>
        <Space direction="vertical">
          <div className="flex items-center gap-3">
            <Switch checked={basicEnabled} onChange={setBasicEnabled} />
            <span className="text-sm text-gray-600">{basicEnabled ? '开启' : '关闭'}</span>
          </div>
        </Space>
      </DemoBlock>

      {/* 禁用状态 */}
      <DemoBlock
        title="禁用状态"
        description="通过设置 disabled 属性来禁用开关。"
        code={disabledSnippet}>
        <Space>
          <Switch checked={disabledOn} disabled />
          <Switch checked={disabledOff} disabled />
        </Space>
      </DemoBlock>

      {/* 不同尺寸 */}
      <DemoBlock title="不同尺寸" description="开关有三种尺寸。" code={sizeSnippet}>
        <Space align="center">
          <Switch checked={sizeSm} size="sm" onChange={setSizeSm} />
          <Switch checked={sizeMd} size="md" onChange={setSizeMd} />
          <Switch checked={sizeLg} size="lg" onChange={setSizeLg} />
        </Space>
      </DemoBlock>
    </div>
  )
}

export default SwitchDemo
