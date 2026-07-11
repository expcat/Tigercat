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
      <Space wrap>
        <Tag variant="default">默认标签</Tag>
        <Tag variant="primary">主要标签</Tag>
        <Tag variant="success">成功标签</Tag>
        <Tag variant="warning">警告标签</Tag>
        <Tag variant="danger">危险标签</Tag>
        <Tag variant="info">信息标签</Tag>
      </Space>
    </>
  )
}
