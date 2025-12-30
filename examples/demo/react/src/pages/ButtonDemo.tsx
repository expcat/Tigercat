import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Space, Divider } from '@tigercat/react'

const ButtonDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Button 按钮</h1>
        <p className="text-gray-600">按钮用于触发一个操作。</p>
      </div>

      {/* 按钮类型 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">按钮类型</h2>
        <p className="text-gray-600 mb-6">按钮有五种类型：主要按钮、次要按钮、轮廓按钮、幽灵按钮和链接按钮。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Button variant="primary">主要按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button variant="outline">轮廓按钮</Button>
            <Button variant="ghost">幽灵按钮</Button>
            <Button variant="link">链接按钮</Button>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 按钮大小 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">按钮大小</h2>
        <p className="text-gray-600 mb-6">按钮有三种尺寸：小、中、大。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space align="center">
            <Button size="sm">小按钮</Button>
            <Button size="md">中按钮</Button>
            <Button size="lg">大按钮</Button>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 按钮状态 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">按钮状态</h2>
        <p className="text-gray-600 mb-6">按钮可以处于正常、禁用或加载状态。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full">
            <div>
              <h3 className="text-sm font-semibold mb-2 text-gray-700">正常状态</h3>
              <Space>
                <Button variant="primary">主要按钮</Button>
                <Button variant="secondary">次要按钮</Button>
                <Button variant="outline">轮廓按钮</Button>
              </Space>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2 text-gray-700">禁用状态</h3>
              <Space>
                <Button variant="primary" disabled>主要按钮</Button>
                <Button variant="secondary" disabled>次要按钮</Button>
                <Button variant="outline" disabled>轮廓按钮</Button>
              </Space>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2 text-gray-700">加载状态</h3>
              <Space>
                <Button variant="primary" loading>主要按钮</Button>
                <Button variant="secondary" loading>次要按钮</Button>
                <Button variant="outline" loading>轮廓按钮</Button>
              </Space>
            </div>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 块级按钮效果 (使用 className) */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">全宽按钮</h2>
        <p className="text-gray-600 mb-6">使用 className 设置按钮宽度。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full">
            <Button variant="primary" className="w-full">主要按钮</Button>
            <Button variant="secondary" className="w-full">次要按钮</Button>
            <Button variant="outline" className="w-full">轮廓按钮</Button>
          </Space>
        </div>
      </section>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <Link to="/" className="text-blue-600 hover:text-blue-800">← 返回首页</Link>
      </div>
    </div>
  )
}

export default ButtonDemo
