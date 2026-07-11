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
    </>
  )
}
