import React from 'react'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical">
          <div className="bg-green-500 text-white px-4 py-2 rounded">Item 1</div>
          <div className="bg-green-500 text-white px-4 py-2 rounded">Item 2</div>
          <div className="bg-green-500 text-white px-4 py-2 rounded">Item 3</div>
        </Space>
      </div>
    </>
  )
}
