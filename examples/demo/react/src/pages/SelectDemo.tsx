import React from 'react'
import { Link } from 'react-router-dom'
import { Select } from '@tigercat/react'

const SelectDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Select 选择器</h1>
        <p className="text-gray-600">当选项过多时，使用下拉菜单展示并选择内容。</p>
      </div>

      {/* 基础用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">基础的 Select 用法。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Select />
        </div>
      </section>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <Link to="/" className="text-blue-600 hover:text-blue-800">← 返回首页</Link>
      </div>
    </div>
  )
}

export default SelectDemo
