import React from 'react'
import { Text } from '@expcat/tigercat-react/Text'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  return (
    <>
      <Space direction="vertical" className="w-full">
        <Text color="primary">主要文本 Primary</Text>
        <Text color="secondary">次要文本 Secondary</Text>
        <Text color="success">成功文本 Success</Text>
        <Text color="warning">警告文本 Warning</Text>
        <Text color="danger">危险文本 Danger</Text>
        <Text color="muted">弱化文本 Muted</Text>
        <Text>默认文本 Default</Text>
      </Space>
    </>
  )
}
