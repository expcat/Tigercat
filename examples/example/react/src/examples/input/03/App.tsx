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
    </>
  )
}
