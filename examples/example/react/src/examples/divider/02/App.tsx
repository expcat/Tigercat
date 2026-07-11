import React from 'react'
import { Divider } from '@expcat/tigercat-react/Divider'

export default function App() {
  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg space-y-4">
        <div>
          <div className="text-gray-700 mb-2">solid</div>
          <Divider lineStyle="solid" />
        </div>
        <div>
          <div className="text-gray-700 mb-2">dashed</div>
          <Divider lineStyle="dashed" />
        </div>
        <div>
          <div className="text-gray-700 mb-2">dotted</div>
          <Divider lineStyle="dotted" />
        </div>
      </div>
    </>
  )
}
