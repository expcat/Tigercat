import React, { useState } from 'react'
import { Radio } from '@expcat/tigercat-react/Radio'
import { RadioGroup } from '@expcat/tigercat-react/RadioGroup'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
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
    <>
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
    </>
  )
}
