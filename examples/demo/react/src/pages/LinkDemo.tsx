import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Link } from '@tigercat/react'

const LinkDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Link 链接</h1>
        <p className="text-gray-600">文字超链接。</p>
      </div>

      {/* 基础用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">基础的 Link 用法。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Link href="https://github.com">链接</Link>
        </div>
      </section>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <RouterLink to="/" className="text-blue-600 hover:text-blue-800">← 返回首页</RouterLink>
      </div>
    </div>
  )
}

export default LinkDemo
