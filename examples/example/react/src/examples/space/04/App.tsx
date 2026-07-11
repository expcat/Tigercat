import React from 'react'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" className="w-full">
          <div>
            <p className="text-sm text-gray-600 mb-2">align="center"</p>
            <Space
              align="center"
              className="w-full border border-dashed border-gray-300 p-3 rounded">
              <div className="bg-amber-500 text-white px-4 py-2 rounded h-10 flex items-center">
                h-10
              </div>
              <div className="bg-amber-500 text-white px-4 py-2 rounded h-16 flex items-center">
                h-16
              </div>
              <div className="bg-amber-500 text-white px-4 py-2 rounded h-12 flex items-center">
                h-12
              </div>
            </Space>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">align="end"</p>
            <Space align="end" className="w-full border border-dashed border-gray-300 p-3 rounded">
              <div className="bg-teal-500 text-white px-4 py-2 rounded h-10 flex items-center">
                h-10
              </div>
              <div className="bg-teal-500 text-white px-4 py-2 rounded h-16 flex items-center">
                h-16
              </div>
              <div className="bg-teal-500 text-white px-4 py-2 rounded h-12 flex items-center">
                h-12
              </div>
            </Space>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">align="baseline"</p>
            <Space
              align="baseline"
              className="w-full border border-dashed border-gray-300 p-3 rounded">
              <div className="bg-rose-500 text-white px-4 py-2 rounded text-sm">Text-sm</div>
              <div className="bg-rose-500 text-white px-4 py-2 rounded text-lg">Text-lg</div>
              <div className="bg-rose-500 text-white px-4 py-2 rounded text-2xl">Text-2xl</div>
            </Space>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">align="stretch"</p>
            <Space
              align="stretch"
              className="w-full border border-dashed border-gray-300 p-3 rounded h-20">
              <div className="bg-indigo-500 text-white px-4 py-2 rounded">Stretch A</div>
              <div className="bg-indigo-500 text-white px-4 py-2 rounded">Stretch B</div>
            </Space>
          </div>
        </Space>
      </div>
    </>
  )
}
