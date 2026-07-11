import React, { useState } from 'react'
import { Checkbox } from '@expcat/tigercat-react/Checkbox'
import { CheckboxGroup } from '@expcat/tigercat-react/CheckboxGroup'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  const [checked, setChecked] = useState(false)

  const [indeterminateValues, setIndeterminateValues] = useState<(string | number | boolean)[]>([
    'apple'
  ])

  const [fruits, setFruits] = useState<(string | number | boolean)[]>(['apple'])

  const [groupSizeValues, setGroupSizeValues] = useState<(string | number | boolean)[]>(['apple'])

  const options = ['apple', 'banana', 'orange']

  const allChecked =
    indeterminateValues.filter((f) => typeof f === 'string').length === options.length

  const indeterminate = indeterminateValues.length > 0 && !allChecked

  const handleFruitsChange = (value: (string | number | boolean)[]) => {
    setFruits(value)
  }

  const handleIndeterminateValuesChange = (value: (string | number | boolean)[]) => {
    setIndeterminateValues(value)
  }

  const handleCheckAllChange = (nextChecked: boolean) => {
    setIndeterminateValues(nextChecked ? [...options] : [])
  }

  return (
    <>
      <Space direction="vertical">
        <Checkbox
          checked={allChecked}
          indeterminate={indeterminate}
          onChange={handleCheckAllChange}>
          全选
        </Checkbox>
        <CheckboxGroup value={indeterminateValues} onChange={handleIndeterminateValuesChange}>
          <Checkbox value={options[0]}>苹果</Checkbox>
          <Checkbox value={options[1]}>香蕉</Checkbox>
          <Checkbox value={options[2]}>橙子</Checkbox>
        </CheckboxGroup>
        <p className="text-sm text-gray-600">
          已选择：
          {indeterminateValues.filter((f) => typeof f === 'string').join(', ')}
        </p>
      </Space>
    </>
  )
}
