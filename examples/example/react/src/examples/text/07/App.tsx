import React from 'react'
import { Text } from '@expcat/tigercat-react/Text'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  return (
    <>
      <Space direction="vertical" className="w-full">
        <div className="w-64">
          <Text truncate>这是一段很长很长的文本，会在容器宽度不足时显示省略号。</Text>
        </div>
        <Text italic>这是一段斜体文本。</Text>
        <Text underline>这是一段带下划线的文本。</Text>
        <Text lineThrough>这是一段带删除线的文本。</Text>
      </Space>
    </>
  )
}
