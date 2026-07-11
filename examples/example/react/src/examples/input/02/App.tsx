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
    </>
  )
}
