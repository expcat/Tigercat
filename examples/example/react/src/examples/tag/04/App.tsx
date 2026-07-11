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
        {tags.map((tag, index) => (
          <Tag key={tag} variant="primary" closable onClose={() => handleClose(index)}>
            {tag}
          </Tag>
        ))}
        {tags.length === 0 && <p className="text-gray-500">所有标签已被移除</p>}
      </Space>
    </>
  )
}
