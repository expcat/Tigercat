import React, { useState } from 'react'
import { Input } from '@expcat/tigercat-react/Input'
import { InputNumber } from '@expcat/tigercat-react/InputNumber'
import { Space } from '@expcat/tigercat-react/Space'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Button } from '@expcat/tigercat-react/Button'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './InputDemo.tsx?raw'
import type { InputStatus } from '@expcat/tigercat-core'

const basicSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <Input value={basicText} onChange={(e) => setBasicText(e.target.value)} placeholder="请输入内容" />
  <p className="text-sm text-gray-600">输入的内容：{basicText}</p>
</Space>`

const basicScriptSnippet = `import { useState } from 'react'

const [basicText, setBasicText] = useState('')`

const controlledSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <FormItem label="受控输入">
    <Input value={controlledText} onChange={(e) => setControlledText(e.target.value)} placeholder="受控输入" />
  </FormItem>
  <FormItem label="非受控输入">
    <Input placeholder="非受控输入" onInput={(e) => setUncontrolledText(e.currentTarget.value)} />
    <p className="text-sm text-gray-600">输入的内容：{uncontrolledText}</p>
  </FormItem>
</Space>`

const controlledScriptSnippet = `import { useState } from 'react'

const [controlledText, setControlledText] = useState('')
const [uncontrolledText, setUncontrolledText] = useState('')`

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
  <FormItem label="电话输入">
    <Input type="tel" placeholder="电话输入" />
  </FormItem>
  <FormItem label="网址输入">
    <Input type="url" placeholder="网址输入" />
  </FormItem>
  <FormItem label="搜索">
    <Input type="search" placeholder="搜索内容" />
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

const affixSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <Input prefix={<span>👤</span>} placeholder="前缀图标" />
  <Input suffix={<span>🔍</span>} placeholder="后缀图标" />
  <Input prefix="￥" suffix="RMB" placeholder="前缀后缀文本" />
</Space>`

const statusSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <Input status="error" placeholder="错误状态" />
  <Input status="warning" placeholder="警告状态" />
  <Input status="success" placeholder="成功状态" />
  <Input status="error" errorMessage="用户名已存在" placeholder="带错误信息" />
</Space>`

const shakeSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <Input status={shakeStatus} errorMessage={shakeError} placeholder="点击按钮触发错误抖动" />
  <Space>
    <Button onClick={triggerShake} variant="primary">触发错误</Button>
    <Button onClick={resetShake}>重置</Button>
  </Space>
</Space>`

const shakeScriptSnippet = `import { useState } from 'react'
import type { InputStatus } from '@expcat/tigercat-core'

const [shakeStatus, setShakeStatus] = useState<InputStatus>('default')
const [shakeError, setShakeError] = useState('')

const triggerShake = () => {
  setShakeStatus('default')
  setShakeError('')
  setTimeout(() => {
    setShakeStatus('error')
    setShakeError('验证失败，请重试！')
  }, 50)
}

const resetShake = () => {
  setShakeStatus('default')
  setShakeError('')
}`

const inputNumberSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <FormItem label="基础">
    <InputNumber value={numValue} onChange={setNumValue} />
  </FormItem>
  <FormItem label="范围 (0~100, step=5)">
    <InputNumber value={numValue} onChange={setNumValue} min={0} max={100} step={5} />
  </FormItem>
  <FormItem label="精度 (2位小数)">
    <InputNumber value={numValue} onChange={setNumValue} precision={2} step={0.1} />
  </FormItem>
</Space>`

const inputNumberControlsSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <FormItem label="右侧按钮（默认）">
    <InputNumber value={numValue} onChange={setNumValue} />
  </FormItem>
  <FormItem label="两侧按钮">
    <InputNumber value={numValue} onChange={setNumValue} controlsPosition="both" />
  </FormItem>
  <FormItem label="千分位格式化">
    <InputNumber
      value={numFormatted}
      onChange={setNumFormatted}
      formatter={(v) => \`$ \${v}\`.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')}
      parser={(v) => Number(v.replace(/\\$\\s?|(,*)/g, ''))}
    />
  </FormItem>
</Space>`

const inputNumberA11y = {
  incrementAriaLabel: '增加数值',
  decrementAriaLabel: '减少数值'
}

const inputNumberScriptSnippet = `import { useState } from 'react'

const [numValue, setNumValue] = useState<number | null>(0)
const [numFormatted, setNumFormatted] = useState<number | null>(1000)`

const InputDemo: React.FC = () => {
  const [basicText, setBasicText] = useState('')
  const [controlledText, setControlledText] = useState('')
  const [uncontrolledText, setUncontrolledText] = useState('')
  const [typeText, setTypeText] = useState('')
  const [password, setPassword] = useState('')
  const [limited, setLimited] = useState('')
  const [disabled] = useState('禁用的输入框')
  const [readonly] = useState('只读的输入框')

  // InputNumber states
  const [numValue, setNumValue] = useState<number | null>(0)
  const [numFormatted, setNumFormatted] = useState<number | null>(1000)

  // Shake demo state
  const [shakeStatus, setShakeStatus] = useState<InputStatus>('default')
  const [shakeError, setShakeError] = useState('')

  const triggerShake = () => {
    setShakeStatus('default')
    setShakeError('')
    setTimeout(() => {
      setShakeStatus('error')
      setShakeError('验证失败，请重试！')
    }, 50)
  }

  const resetShake = () => {
    setShakeStatus('default')
    setShakeError('')
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Input 输入框</h1>
        <p className="text-gray-600 dark:text-gray-400">
          通过鼠标或键盘输入内容，是最基础的表单域的包装。
        </p>
      </div>

      <DemoBlock
        title="输入方式与外观"
        description="合并展示基础输入、受控/非受控、常见类型、尺寸、禁用只读和前后缀。"
        code={fullPageSnippet}>
        <Space direction="vertical" className="w-full max-w-2xl" size="lg">
          <FormItem label="基础输入">
            <Input
              value={basicText}
              onChange={(e) => setBasicText(e.target.value)}
              placeholder="请输入内容"
            />
            <p className="text-sm text-gray-600">输入的内容：{basicText}</p>
          </FormItem>
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormItem label="文本 / 密码">
              <Space direction="vertical" className="w-full">
                <Input
                  value={typeText}
                  onChange={(e) => setTypeText(e.target.value)}
                  type="text"
                  placeholder="文本输入"
                />
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="密码输入"
                />
              </Space>
            </FormItem>
            <FormItem label="其他类型">
              <Space direction="vertical" className="w-full">
                <Input type="email" placeholder="邮箱输入" />
                <Input type="tel" placeholder="电话输入" />
                <Input type="search" placeholder="搜索内容" />
              </Space>
            </FormItem>
          </div>
          <FormItem label="尺寸">
            <Space direction="vertical" className="w-full max-w-md">
              <Input size="sm" placeholder="小尺寸输入框" />
              <Input size="md" placeholder="中尺寸输入框" />
              <Input size="lg" placeholder="大尺寸输入框" />
            </Space>
          </FormItem>
          <div className="grid gap-4 md:grid-cols-2">
            <FormItem label="禁用 / 只读">
              <Space direction="vertical" className="w-full">
                <Input value={disabled} disabled />
                <Input value={readonly} readonly />
              </Space>
            </FormItem>
            <FormItem label="前缀 / 后缀">
              <Space direction="vertical" className="w-full">
                <Input prefix={<span>👤</span>} placeholder="前缀图标" />
                <Input suffix={<span>🔍</span>} placeholder="后缀图标" />
                <Input prefix="￥" suffix="RMB" placeholder="前缀后缀文本" />
              </Space>
            </FormItem>
          </div>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="约束与反馈"
        description="合并展示 required、长度限制、状态提示和错误抖动。"
        code={fullPageSnippet}>
        <Space direction="vertical" className="w-full max-w-2xl" size="lg">
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>
          <FormItem label="状态与错误提示">
            <Space direction="vertical" className="w-full max-w-md">
              <Input status="error" placeholder="错误状态" />
              <Input status="warning" placeholder="警告状态" />
              <Input status="success" placeholder="成功状态" />
              <Input status="error" errorMessage="用户名已存在" placeholder="带错误信息" />
            </Space>
          </FormItem>
          <FormItem label="错误抖动">
            <Space direction="vertical" className="w-full max-w-md">
              <Input
                status={shakeStatus}
                errorMessage={shakeError}
                placeholder="点击按钮触发错误抖动"
              />
              <Space>
                <Button onClick={triggerShake} variant="primary">
                  触发错误
                </Button>
                <Button onClick={resetShake}>重置</Button>
              </Space>
            </Space>
          </FormItem>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="数字输入框 InputNumber"
        description="合并展示数值范围、精度、尺寸、状态、步进按钮和格式化。"
        code={fullPageSnippet}>
        <Space direction="vertical" className="w-full max-w-2xl" size="lg">
          <div className="grid gap-4 md:grid-cols-2">
            <FormItem label="基础 / 范围 / 精度">
              <Space direction="vertical" className="w-full">
                <InputNumber value={numValue} onChange={setNumValue} {...inputNumberA11y} />
                <InputNumber
                  value={numValue}
                  onChange={setNumValue}
                  min={0}
                  max={100}
                  step={5}
                  {...inputNumberA11y}
                />
                <InputNumber
                  value={numValue}
                  onChange={setNumValue}
                  precision={2}
                  step={0.1}
                  {...inputNumberA11y}
                />
              </Space>
            </FormItem>
            <FormItem label="尺寸与状态">
              <Space direction="vertical" className="w-full">
                <Space>
                  <InputNumber
                    value={numValue}
                    onChange={setNumValue}
                    size="sm"
                    {...inputNumberA11y}
                  />
                  <InputNumber
                    value={numValue}
                    onChange={setNumValue}
                    size="md"
                    {...inputNumberA11y}
                  />
                  <InputNumber
                    value={numValue}
                    onChange={setNumValue}
                    size="lg"
                    {...inputNumberA11y}
                  />
                </Space>
                <Space>
                  <InputNumber value={5} disabled {...inputNumberA11y} />
                  <InputNumber value={5} readonly {...inputNumberA11y} />
                  <InputNumber
                    value={numValue}
                    onChange={setNumValue}
                    status="error"
                    {...inputNumberA11y}
                  />
                </Space>
              </Space>
            </FormItem>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormItem label="步进按钮">
              <Space direction="vertical" className="w-full">
                <InputNumber value={numValue} onChange={setNumValue} {...inputNumberA11y} />
                <InputNumber
                  value={numValue}
                  onChange={setNumValue}
                  controlsPosition="both"
                  {...inputNumberA11y}
                />
                <InputNumber value={numValue} onChange={setNumValue} controls={false} />
              </Space>
            </FormItem>
            <FormItem label="千分位格式化">
              <InputNumber
                value={numFormatted}
                onChange={setNumFormatted}
                formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => Number(v.replace(/\$\s?|(,*)/g, ''))}
                {...inputNumberA11y}
              />
            </FormItem>
          </div>
        </Space>
      </DemoBlock>
    </div>
  )
}

export default InputDemo
