import React from 'react'
import { Divider } from '@expcat/tigercat-react/Divider'

export default function App() {
  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="flex items-center h-12">
          <span className="text-gray-700 dark:text-gray-300">Left</span>
          <Divider orientation="vertical" className="h-6" />
          <span className="text-gray-700 dark:text-gray-300">Middle</span>
          <Divider orientation="vertical" className="h-6" lineStyle="dashed" />
          <span className="text-gray-700 dark:text-gray-300">Right</span>
        </div>
      </div>
    </>
  )
}
