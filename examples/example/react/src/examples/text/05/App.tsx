import React from 'react'
import { Text } from '@expcat/tigercat-react/Text'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  return (
    <>
      <Space direction="vertical" className="w-full">
        <Text weight="normal">Normal</Text>
        <Text weight="semibold">Semibold</Text>
        <Text weight="bold">Bold</Text>
      </Space>
    </>
  )
}
