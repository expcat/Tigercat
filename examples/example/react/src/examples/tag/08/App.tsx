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
      <Space align="center" wrap>
        <Tag size="sm" variant="success" closable>
          小标签
        </Tag>
        <Tag size="md" variant="success" closable>
          中标签
        </Tag>
        <Tag size="lg" variant="success" closable>
          大标签
        </Tag>
      </Space>
    </>
  )
}
