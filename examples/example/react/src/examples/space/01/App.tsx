import React from 'react'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <Space>
          <div className="bg-blue-500 text-white px-4 py-2 rounded">Item 1</div>
          <div className="bg-blue-500 text-white px-4 py-2 rounded">Item 2</div>
          <div className="bg-blue-500 text-white px-4 py-2 rounded">Item 3</div>
        </Space>
      </div>
    </>
  )
}
