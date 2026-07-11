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
      <Tag closable onClose={(e) => e.preventDefault()}>
        点击关闭按钮不会消失
      </Tag>
    </>
  )
}
