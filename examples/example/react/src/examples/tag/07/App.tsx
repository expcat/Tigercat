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
        <Tag variant="default" closable>
          默认标签
        </Tag>
        <Tag variant="primary" closable>
          主要标签
        </Tag>
        <Tag variant="success" closable>
          成功标签
        </Tag>
        <Tag variant="warning" closable>
          警告标签
        </Tag>
        <Tag variant="danger" closable>
          危险标签
        </Tag>
        <Tag variant="info" closable>
          信息标签
        </Tag>
      </Space>
    </>
  )
}
