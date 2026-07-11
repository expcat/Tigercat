import React from 'react'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" className="w-full">
          <div>
            <p className="text-sm text-gray-600 mb-2">size="sm"</p>
            <Space size="sm">
              <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
              <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
              <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
            </Space>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">size="md"（默认）</p>
            <Space size="md">
              <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
              <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
              <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
            </Space>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">size="lg"</p>
            <Space size="lg">
              <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
              <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
              <div className="bg-purple-500 text-white px-4 py-2 rounded">Item</div>
            </Space>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">size={24}（自定义 px）</p>
            <Space size={24}>
              <div className="bg-purple-600 text-white px-4 py-2 rounded">24px</div>
              <div className="bg-purple-600 text-white px-4 py-2 rounded">24px</div>
              <div className="bg-purple-600 text-white px-4 py-2 rounded">24px</div>
            </Space>
          </div>
        </Space>
      </div>
    </>
  )
}
