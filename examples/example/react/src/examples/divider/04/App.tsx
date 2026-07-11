import React from 'react'
import { Divider } from '@expcat/tigercat-react/Divider'

export default function App() {
  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="text-gray-700 dark:text-gray-300">color="#2563eb" thickness="2px"</div>
        <Divider color="#2563eb" thickness="2px" />
        <div className="text-gray-700 dark:text-gray-300">
          color="#10b981" thickness="4px"（dashed）
        </div>
        <Divider color="#10b981" thickness="4px" lineStyle="dashed" />
      </div>
    </>
  )
}
