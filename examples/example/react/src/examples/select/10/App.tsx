import React, { useState } from 'react'
import { Select } from '@expcat/tigercat-react/Select'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  const [basicValue, setBasicValue] = useState<string | number>('')

  const [defaultValue, setDefaultValue] = useState<string | number>('china')

  const [disabledValue] = useState<string | number>('china')

  const [sizeSmValue, setSizeSmValue] = useState<string | number>('option1')

  const [sizeMdValue, setSizeMdValue] = useState<string | number>('option2')

  const [sizeLgValue, setSizeLgValue] = useState<string | number>('option3')

  const [disabledOptionValue, setDisabledOptionValue] = useState<string | number>('')

  const [clearableValue, setClearableValue] = useState<string | number>('option2')

  const [notClearableValue, setNotClearableValue] = useState<string | number>('option2')

  const [searchableValue, setSearchableValue] = useState<string | number>('')

  const [lastSearchQuery, setLastSearchQuery] = useState('')

  const [multipleValue, setMultipleValue] = useState<(string | number)[]>(['option1', 'option3'])

  const [multiSearchValue, setMultiSearchValue] = useState<(string | number)[]>([])

  const [groupedValue, setGroupedValue] = useState<string | number>('apple')

  const [emptyValue, setEmptyValue] = useState<string | number>('')

  const options = [
    { label: '选项 1', value: 'option1' },
    { label: '选项 2', value: 'option2' },
    { label: '选项 3', value: 'option3' },
    { label: '选项 4', value: 'option4' }
  ]

  const optionsWithDisabled = [
    { label: '可用选项', value: 'enabled' },
    { label: '禁用选项', value: 'disabled', disabled: true },
    { label: '另一个选项', value: 'another' }
  ]

  const countries = [
    { label: '中国', value: 'china' },
    { label: '美国', value: 'usa' },
    { label: '日本', value: 'japan' },
    { label: '英国', value: 'uk' },
    { label: '法国', value: 'france' }
  ]

  const groupedOptions = [
    {
      label: '水果',
      options: [
        { label: '苹果', value: 'apple' },
        { label: '香蕉', value: 'banana' },
        { label: '橙子', value: 'orange' }
      ]
    },
    {
      label: '蔬菜',
      options: [
        { label: '西红柿', value: 'tomato' },
        { label: '黄瓜', value: 'cucumber' },
        { label: '土豆', value: 'potato' }
      ]
    }
  ]

  return (
    <>
      <Space direction="vertical" className="w-full max-w-md">
        <Select
          value={groupedValue}
          onChange={(v) => setGroupedValue(v ?? '')}
          options={groupedOptions}
        />
        <p className="text-sm text-gray-600">选中的值：{groupedValue}</p>
      </Space>
    </>
  )
}
