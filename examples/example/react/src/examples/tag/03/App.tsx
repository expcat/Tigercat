import React, { useState } from 'react'
import { Tag } from '@expcat/tigercat-react/Tag'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  const [tags, setTags] = useState(['标签一', '标签二', '标签三'])

  const handleClose = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  return (
    <>
      <Space align="center">
        <Tag size="sm" variant="primary">
          小标签
        </Tag>
        <Tag size="md" variant="primary">
          中标签
        </Tag>
        <Tag size="lg" variant="primary">
          大标签
        </Tag>
      </Space>
    </>
  )
}
