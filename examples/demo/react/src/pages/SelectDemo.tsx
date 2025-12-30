import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Select, Space, Divider } from '@tigercat/react'

const SelectDemo: React.FC = () => {
  const [selected, setSelected] = useState('')
  const [country, setCountry] = useState('china')

  const handleSelectedChange = (value: string | number | (string | number)[] | undefined) => {
    setSelected(String(value || ''))
  }

  const handleCountryChange = (value: string | number | (string | number)[] | undefined) => {
    setCountry(String(value || ''))
  }

  const options = [
    { label: '选项 1', value: 'option1' },
    { label: '选项 2', value: 'option2' },
    { label: '选项 3', value: 'option3' },
    { label: '选项 4', value: 'option4' },
  ]

  const countries = [
    { label: '中国', value: 'china' },
    { label: '美国', value: 'usa' },
    { label: '日本', value: 'japan' },
    { label: '英国', value: 'uk' },
    { label: '法国', value: 'france' },
  ]

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Select 选择器</h1>
        <p className="text-gray-600">当选项过多时，使用下拉菜单展示并选择内容。</p>
      </div>

      {/* 基础用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">适用广泛的基础选择器。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Select value={selected} onChange={handleSelectedChange} options={options} placeholder="请选择" />
            <p className="text-sm text-gray-600">选中的值：{selected || '未选择'}</p>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 有默认值 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">有默认值</h2>
        <p className="text-gray-600 mb-6">可以设置默认选中的值。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Select value={country} onChange={handleCountryChange} options={countries} />
            <p className="text-sm text-gray-600">选中的国家：{country}</p>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 禁用状态 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用状态</h2>
        <p className="text-gray-600 mb-6">禁用整个选择器组件。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Select value={country} options={countries} disabled />
          </Space>
        </div>
      </section>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <Link to="/" className="text-blue-600 hover:text-blue-800">← 返回首页</Link>
      </div>
    </div>
  )
}

export default SelectDemo
