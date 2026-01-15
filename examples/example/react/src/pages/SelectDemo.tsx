import React, { useState } from 'react'
import { Select, Space } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <Select value={basicValue} onChange={(v) => setBasicValue(v ?? '')} options={options} placeholder="请选择" />
  <p className="text-sm text-gray-600">选中的值：{basicValue || '未选择'}</p>
</Space>`

const defaultSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <Select value={defaultValue} onChange={(v) => setDefaultValue(v ?? '')} options={countries} />
  <p className="text-sm text-gray-600">选中的国家：{defaultValue}</p>
</Space>`

const disabledSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <Select value={disabledValue} options={countries} disabled />
</Space>`

const sizeSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <div className="w-full">
    <p className="text-sm text-gray-600 mb-2">sm</p>
    <Select value={sizeSmValue} onChange={(v) => setSizeSmValue(v ?? '')} options={options} size="sm" />
  </div>
  <div className="w-full">
    <p className="text-sm text-gray-600 mb-2">md</p>
    <Select value={sizeMdValue} onChange={(v) => setSizeMdValue(v ?? '')} options={options} size="md" />
  </div>
  <div className="w-full">
    <p className="text-sm text-gray-600 mb-2">lg</p>
    <Select value={sizeLgValue} onChange={(v) => setSizeLgValue(v ?? '')} options={options} size="lg" />
  </div>
</Space>`

const disabledOptionSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <Select value={disabledOptionValue} onChange={(v) => setDisabledOptionValue(v ?? '')} options={optionsWithDisabled} placeholder="请选择" />
  <p className="text-sm text-gray-600">选中的值：{disabledOptionValue || '未选择'}</p>
</Space>`

const clearableSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <div className="w-full">
    <p className="text-sm text-gray-600 mb-2">clearable: true</p>
    <Select value={clearableValue} onChange={(v) => setClearableValue(v ?? '')} options={options} />
  </div>
  <div className="w-full">
    <p className="text-sm text-gray-600 mb-2">clearable: false</p>
    <Select value={notClearableValue} onChange={(v) => setNotClearableValue(v ?? '')} options={options} clearable={false} />
  </div>
</Space>`

const searchableSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <Select
    value={searchableValue}
    onChange={(v) => setSearchableValue(v ?? '')}
    options={countries}
    searchable
    placeholder="搜索国家"
    onSearch={(q) => setLastSearchQuery(q)}
  />
  <p className="text-sm text-gray-600">最近一次搜索：{lastSearchQuery || '（无）'}</p>
</Space>`

const multipleSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <Select value={multipleValue} onChange={(v) => setMultipleValue(v)} options={options} multiple placeholder="请选择多个" />
  <p className="text-sm text-gray-600">选中：{multipleValue.length ? multipleValue.join(', ') : '未选择'}</p>
</Space>`

const groupedSnippet = `<Space direction="vertical" className="w-full max-w-md">
  <Select value={groupedValue} onChange={(v) => setGroupedValue(v ?? '')} options={groupedOptions} />
  <p className="text-sm text-gray-600">选中的值：{groupedValue}</p>
</Space>`

const emptySnippet = `<Space direction="vertical" className="w-full max-w-md">
  <Select value={emptyValue} onChange={(v) => setEmptyValue(v ?? '')} options={[]} noDataText="暂无数据" placeholder="无可用选项" />
</Space>`

const SelectDemo: React.FC = () => {
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
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Select 选择器</h1>
        <p className="text-gray-600">当选项过多时，使用下拉菜单展示并选择内容。</p>
      </div>

      {/* 基础用法 */}
      <DemoBlock title="基础用法" description="适用广泛的基础选择器。" code={basicSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <Select
            value={basicValue}
            onChange={(v) => setBasicValue(v ?? '')}
            options={options}
            placeholder="请选择"
          />
          <p className="text-sm text-gray-600">选中的值：{basicValue || '未选择'}</p>
        </Space>
      </DemoBlock>

      {/* 有默认值 */}
      <DemoBlock title="有默认值" description="可以设置默认选中的值。" code={defaultSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <Select
            value={defaultValue}
            onChange={(v) => setDefaultValue(v ?? '')}
            options={countries}
          />
          <p className="text-sm text-gray-600">选中的国家：{defaultValue}</p>
        </Space>
      </DemoBlock>

      {/* 禁用状态 */}
      <DemoBlock title="禁用状态" description="禁用整个选择器组件。" code={disabledSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <Select value={disabledValue} options={countries} disabled />
        </Space>
      </DemoBlock>

      {/* 不同尺寸 */}
      <DemoBlock
        title="不同尺寸"
        description="Select 支持 sm / md / lg 三种尺寸。"
        code={sizeSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <div className="w-full">
            <p className="text-sm text-gray-600 mb-2">sm</p>
            <Select
              value={sizeSmValue}
              onChange={(v) => setSizeSmValue(v ?? '')}
              options={options}
              size="sm"
            />
          </div>
          <div className="w-full">
            <p className="text-sm text-gray-600 mb-2">md</p>
            <Select
              value={sizeMdValue}
              onChange={(v) => setSizeMdValue(v ?? '')}
              options={options}
              size="md"
            />
          </div>
          <div className="w-full">
            <p className="text-sm text-gray-600 mb-2">lg</p>
            <Select
              value={sizeLgValue}
              onChange={(v) => setSizeLgValue(v ?? '')}
              options={options}
              size="lg"
            />
          </div>
        </Space>
      </DemoBlock>

      {/* 禁用选项 */}
      <DemoBlock title="禁用选项" description="可以禁用单个选项。" code={disabledOptionSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <Select
            value={disabledOptionValue}
            onChange={(v) => setDisabledOptionValue(v ?? '')}
            options={optionsWithDisabled}
            placeholder="请选择"
          />
          <p className="text-sm text-gray-600">选中的值：{disabledOptionValue || '未选择'}</p>
        </Space>
      </DemoBlock>

      {/* 可清空 */}
      <DemoBlock
        title="可清空"
        description="默认支持清空，也可以关闭清空功能。"
        code={clearableSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <div className="w-full">
            <p className="text-sm text-gray-600 mb-2">clearable: true</p>
            <Select
              value={clearableValue}
              onChange={(v) => setClearableValue(v ?? '')}
              options={options}
            />
          </div>
          <div className="w-full">
            <p className="text-sm text-gray-600 mb-2">clearable: false</p>
            <Select
              value={notClearableValue}
              onChange={(v) => setNotClearableValue(v ?? '')}
              options={options}
              clearable={false}
            />
          </div>
        </Space>
      </DemoBlock>

      {/* 可搜索 */}
      <DemoBlock
        title="可搜索"
        description="启用 searchable 后可在下拉中输入关键字过滤选项。"
        code={searchableSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <Select
            value={searchableValue}
            onChange={(v) => setSearchableValue(v ?? '')}
            options={countries}
            searchable
            placeholder="搜索国家"
            onSearch={(q) => setLastSearchQuery(q)}
          />
          <p className="text-sm text-gray-600">最近一次搜索：{lastSearchQuery || '（无）'}</p>
        </Space>
      </DemoBlock>

      {/* 多选 */}
      <DemoBlock title="多选" description="启用 multiple 后可选择多个选项。" code={multipleSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <Select
            value={multipleValue}
            onChange={(v) => setMultipleValue(v)}
            options={options}
            multiple
            placeholder="请选择多个"
          />
          <p className="text-sm text-gray-600">
            选中：{multipleValue.length ? multipleValue.join(', ') : '未选择'}
          </p>
        </Space>
      </DemoBlock>

      {/* 分组选项 */}
      <DemoBlock
        title="分组选项"
        description="支持传入分组数据（group label + options）。"
        code={groupedSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <Select
            value={groupedValue}
            onChange={(v) => setGroupedValue(v ?? '')}
            options={groupedOptions}
          />
          <p className="text-sm text-gray-600">选中的值：{groupedValue}</p>
        </Space>
      </DemoBlock>

      {/* 空状态 */}
      <DemoBlock
        title="空状态"
        description="当 options 为空时，会显示空提示文案。"
        code={emptySnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <Select
            value={emptyValue}
            onChange={(v) => setEmptyValue(v ?? '')}
            options={[]}
            noDataText="暂无数据"
            placeholder="无可用选项"
          />
        </Space>
      </DemoBlock>
    </div>
  )
}

export default SelectDemo
