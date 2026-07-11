import React from 'react'
import { Divider } from '@expcat/tigercat-react/Divider'

export default function App() {
  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="text-gray-700 dark:text-gray-300">none</div>
        <Divider spacing="none" />
        <div className="text-gray-700 dark:text-gray-300">xs</div>
        <Divider spacing="xs" />
        <div className="text-gray-700 dark:text-gray-300">sm</div>
        <Divider spacing="sm" />
        <div className="text-gray-700 dark:text-gray-300">md (default)</div>
        <Divider spacing="md" />
        <div className="text-gray-700 dark:text-gray-300">lg</div>
        <Divider spacing="lg" />
        <div className="text-gray-700 dark:text-gray-300">xl</div>
        <Divider spacing="xl" />
      </div>
    </>
  )
}
