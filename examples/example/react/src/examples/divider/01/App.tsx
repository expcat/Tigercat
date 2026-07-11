import React from 'react'
import { Divider } from '@expcat/tigercat-react/Divider'

export default function App() {
  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="text-gray-700 dark:text-gray-300">上方内容</div>
        <Divider />
        <div className="text-gray-700 dark:text-gray-300">下方内容</div>
      </div>
    </>
  )
}
