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
    </>
  )
}
