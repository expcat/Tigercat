import React from 'react'
import { Link } from 'react-router-dom'
import { Form } from '@tigercat/react'

const FormDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Form 表单</h1>
        <p className="text-gray-600">由输入框、选择器、单选框、多选框等控件组成，用以收集、校验、提交数据。</p>
      </div>

      {/* 基础用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">基础的 Form 用法。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Form />
        </div>
      </section>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <Link to="/" className="text-blue-600 hover:text-blue-800">← 返回首页</Link>
      </div>
    </div>
  )
}

export default FormDemo
