import React from 'react'
import { Text } from '@expcat/tigercat-react/Text'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  return (
    <>
      <Space direction="vertical" align="start" className="w-full">
        <Text size="sm">小号文本</Text>
        <Text size="base">中号文本</Text>
        <Text size="lg">大号文本</Text>
      </Space>
    </>
  )
}
