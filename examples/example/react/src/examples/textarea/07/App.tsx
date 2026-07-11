import React, { useState } from 'react'
import { Textarea } from '@expcat/tigercat-react/Textarea'
import { Space } from '@expcat/tigercat-react/Space'
import { FormItem } from '@expcat/tigercat-react/FormItem'

export default function App() {
  const [text, setText] = useState('')

  const [autoResizeText, setAutoResizeText] = useState('')

  const [limited, setLimited] = useState('')

  const [combined, setCombined] = useState('')

  return (
    <>
      <Space direction="vertical" className="w-full max-w-md">
        <Textarea
          value={combined}
          onInput={(e) => setCombined(e.currentTarget.value)}
          autoResize
          minRows={3}
          maxRows={10}
          showCount
          maxLength={500}
          placeholder="自动高度 + 字符计数 + 最大长度"
        />
      </Space>
    </>
  )
}
