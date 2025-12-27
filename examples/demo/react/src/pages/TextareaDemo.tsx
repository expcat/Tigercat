import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Textarea, Space, Divider, FormItem } from '@tigercat/react'

const TextareaDemo: React.FC = () => {
  const [text, setText] = useState('')
  const [disabled] = useState('禁用的文本域')
  const [readonly] = useState('只读的文本域')

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Textarea 文本域</h1>
        <p className="text-gray-600">输入多行文本时使用。</p>
      </div>

      {/* 基础用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">基础的文本域组件。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="请输入内容" rows={4} />
            <p className="text-sm text-gray-600">输入的内容：{text}</p>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 不同行数 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不同行数</h2>
        <p className="text-gray-600 mb-6">通过 rows 属性设置文本域的行数。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <FormItem label="2行">
              <Textarea placeholder="2行文本域" rows={2} />
            </FormItem>
            <FormItem label="4行">
              <Textarea placeholder="4行文本域" rows={4} />
            </FormItem>
            <FormItem label="6行">
              <Textarea placeholder="6行文本域" rows={6} />
            </FormItem>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 禁用和只读 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用和只读</h2>
        <p className="text-gray-600 mb-6">文本域可以设置为禁用或只读状态。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Textarea value={disabled} disabled rows={3} />
            <Textarea value={readonly} readonly rows={3} />
          </Space>
        </div>
      </section>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <Link to="/" className="text-blue-600 hover:text-blue-800">← 返回首页</Link>
      </div>
    </div>
  )
}

export default TextareaDemo
