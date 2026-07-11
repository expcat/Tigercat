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
        <Tag variant="info" closable closeAriaLabel="移除标签：JavaScript">
          JavaScript
        </Tag>
        <Tag variant="success" closable closeAriaLabel="移除标签：已完成">
          已完成
        </Tag>
      </Space>
    </>
  )
}
