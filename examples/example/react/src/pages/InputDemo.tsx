import React, { useState } from 'react'
import { Input, Space, FormItem } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <Input value={basicText} onChange={(e) => setBasicText(e.target.value)} placeholder="请输入内容" />
  <p className="text-sm text-gray-600">输入的内容：{basicText}</p>
</Space>`

const controlledSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <FormItem label="受控输入">
    <Input value={controlledText} onChange={(e) => setControlledText(e.target.value)} placeholder="受控输入" />
  </FormItem>
  <FormItem label="非受控输入">
    <Input placeholder="非受控输入" onInput={(e) => setUncontrolledText(e.currentTarget.value)} />
    <p className="text-sm text-gray-600">输入的内容：{uncontrolledText}</p>
  </FormItem>
</Space>`

const typeSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <FormItem label="文本输入">
    <Input value={typeText} onChange={(e) => setTypeText(e.target.value)} type="text" placeholder="文本输入" />
  </FormItem>
  <FormItem label="密码输入">
    <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="密码输入" />
  </FormItem>
  <FormItem label="数字输入">
    <Input type="number" placeholder="数字输入" />
  </FormItem>
  <FormItem label="邮箱输入">
    <Input type="email" placeholder="邮箱输入" />
  </FormItem>
</Space>`

const sizeSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <Input size="sm" placeholder="小尺寸输入框" />
  <Input size="md" placeholder="中尺寸输入框" />
  <Input size="lg" placeholder="大尺寸输入框" />
</Space>`

const disabledSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <Input value={disabled} disabled />
  <Input value={readonly} readonly />
</Space>`

const limitSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <FormItem label="必填输入">
    <Input required placeholder="必填项" />
  </FormItem>
  <FormItem label="长度限制（3~10）">
    <Input value={limited} onChange={(e) => setLimited(e.target.value)} minLength={3} maxLength={10} placeholder="请输入 3~10 个字符" />
    <p className="text-sm text-gray-600">当前长度：{limited.length}</p>
  </FormItem>
</Space>`

const InputDemo: React.FC = () => {
  const [basicText, setBasicText] = useState('')
  const [controlledText, setControlledText] = useState('')
  const [uncontrolledText, setUncontrolledText] = useState('')
  const [typeText, setTypeText] = useState('')
  const [password, setPassword] = useState('')
  const [limited, setLimited] = useState('')
  const [disabled] = useState('禁用的输入框')
  const [readonly] = useState('只读的输入框')

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Input 输入框</h1>
        <p className="text-gray-600">通过鼠标或键盘输入内容，是最基础的表单域的包装。</p>
      </div>

      {/* 基础用法 */}
      <DemoBlock title="基础用法" description="基础的输入框组件。" code={basicSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <Input
            value={basicText}
            onChange={(e) => setBasicText(e.target.value)}
            placeholder="请输入内容"
          />
          <p className="text-sm text-gray-600">输入的内容：{basicText}</p>
        </Space>
      </DemoBlock>

      {/* 受控与非受控 */}
      <DemoBlock
        title="受控与非受控"
        description="受控模式绑定值（value/onChange）；非受控模式不绑定 value，仅监听 input 事件。"
        code={controlledSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <FormItem label="受控输入">
            <Input
              value={controlledText}
              onChange={(e) => setControlledText(e.target.value)}
              placeholder="受控输入"
            />
          </FormItem>
          <FormItem label="非受控输入">
            <Input
              placeholder="非受控输入"
              onInput={(e) => setUncontrolledText(e.currentTarget.value)}
            />
            <p className="text-sm text-gray-600">输入的内容：{uncontrolledText}</p>
          </FormItem>
        </Space>
      </DemoBlock>

      {/* 不同类型 */}
      <DemoBlock title="不同类型" description="Input 支持多种类型，如文本、密码、数字等。" code={typeSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <FormItem label="文本输入">
            <Input
              value={typeText}
              onChange={(e) => setTypeText(e.target.value)}
              type="text"
              placeholder="文本输入"
            />
          </FormItem>
          <FormItem label="密码输入">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="密码输入"
            />
          </FormItem>
          <FormItem label="数字输入">
            <Input type="number" placeholder="数字输入" />
          </FormItem>
          <FormItem label="邮箱输入">
            <Input type="email" placeholder="邮箱输入" />
          </FormItem>
        </Space>
      </DemoBlock>

      {/* 不同尺寸 */}
      <DemoBlock title="不同尺寸" description="输入框有三种尺寸：小、中、大。" code={sizeSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <Input size="sm" placeholder="小尺寸输入框" />
          <Input size="md" placeholder="中尺寸输入框" />
          <Input size="lg" placeholder="大尺寸输入框" />
        </Space>
      </DemoBlock>

      {/* 禁用和只读 */}
      <DemoBlock title="禁用和只读" description="输入框可以设置为禁用或只读状态。" code={disabledSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <Input value={disabled} disabled />
          <Input value={readonly} readonly />
        </Space>
      </DemoBlock>

      {/* 必填与长度限制 */}
      <DemoBlock
        title="必填与长度限制"
        description="使用 required / minLength / maxLength 约束输入。"
        code={limitSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <FormItem label="必填输入">
            <Input required placeholder="必填项" />
          </FormItem>
          <FormItem label="长度限制（3~10）">
            <Input
              value={limited}
              onChange={(e) => setLimited(e.target.value)}
              minLength={3}
              maxLength={10}
              placeholder="请输入 3~10 个字符"
            />
            <p className="text-sm text-gray-600">当前长度：{limited.length}</p>
          </FormItem>
        </Space>
      </DemoBlock>
    </div>
  )
}

export default InputDemo
