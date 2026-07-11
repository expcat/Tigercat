import React from 'react'
import { Text } from '@expcat/tigercat-react/Text'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  return (
    <>
      <Space direction="vertical" className="w-full">
        <Text tag="h3" size="lg" weight="semibold">
          Heading (h3)
        </Text>
        <Text tag="label" size="sm" color="muted">
          Label text
        </Text>
        <Text tag="p">Paragraph text</Text>
      </Space>
    </>
  )
}
