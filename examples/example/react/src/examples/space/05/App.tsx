import React from 'react'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="max-w-md">
          <Space wrap size="sm" className="w-full">
            {Array.from({ length: 14 }).map((_, index) => (
              <div key={index} className="bg-slate-700 text-white px-3 py-2 rounded">
                Tag {index + 1}
              </div>
            ))}
          </Space>
        </div>
      </div>
    </>
  )
}
