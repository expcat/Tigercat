import React from 'react'
import { Text } from '@expcat/tigercat-react/Text'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  return (
    <>
      <Space direction="vertical" className="w-full">
        <Text>这是一段默认段落文本。</Text>
        <Text tag="span" className="block">
          这是一段 span 文本（通过 className 设置为 block）。
        </Text>
        <Text tag="div">这是一段 div 文本。</Text>
      </Space>
    </>
  )
}
