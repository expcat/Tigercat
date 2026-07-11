import React, { useState } from 'react'
import { Input } from '@expcat/tigercat-react/Input'
import { InputNumber } from '@expcat/tigercat-react/InputNumber'
import { Space } from '@expcat/tigercat-react/Space'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Button } from '@expcat/tigercat-react/Button'
import type { InputStatus } from '@expcat/tigercat-core'

const inputNumberA11y = {
  incrementAriaLabel: '增加数值',
  decrementAriaLabel: '减少数值'
}

export default function App() {
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
    <>
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
    </>
  )
}
