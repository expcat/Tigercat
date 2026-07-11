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
      <RadioGroup
        value={customValue}
        onChange={setCustomValue}
        className="flex flex-wrap items-center gap-6"
        name="custom-radio">
        <Radio value="a" className="bg-blue-50 px-3 py-1 rounded">
          选项 A
        </Radio>
        <Radio value="b" className="bg-green-50 px-3 py-1 rounded">
          选项 B
        </Radio>
      </RadioGroup>
    </>
  )
}
