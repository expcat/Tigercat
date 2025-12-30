import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Radio, RadioGroup, Space, Divider } from '@tigercat/react'

const RadioDemo: React.FC = () => {
  const [gender, setGender] = useState('male')
  const [size, setSize] = useState('medium')

  const handleGenderChange = (value: string | number) => {
    setGender(String(value))
  }

  const handleSizeChange = (value: string | number) => {
    setSize(String(value))
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Radio 单选框</h1>
        <p className="text-gray-600">在一组备选项中进行单选。</p>
      </div>

      {/* 基础用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">单选框组合使用时，需要通过 RadioGroup 组件进行包裹。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical">
            <RadioGroup value={gender} onChange={handleGenderChange}>
              <Radio value="male">男</Radio>
              <Radio value="female">女</Radio>
              <Radio value="other">其他</Radio>
            </RadioGroup>
            <p className="text-sm text-gray-600">选中的性别：{gender}</p>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 禁用状态 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用状态</h2>
        <p className="text-gray-600 mb-6">单选框不可用的状态。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <RadioGroup value={size} onChange={handleSizeChange}>
            <Radio value="small">小</Radio>
            <Radio value="medium">中</Radio>
            <Radio value="large" disabled>大（禁用）</Radio>
          </RadioGroup>
        </div>
      </section>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <Link to="/" className="text-blue-600 hover:text-blue-800">← 返回首页</Link>
      </div>
    </div>
  )
}

export default RadioDemo
