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
          value={text}
          onInput={(e) => setText(e.currentTarget.value)}
          placeholder="请输入内容"
          rows={4}
        />
        <p className="text-sm text-gray-600">输入的内容：{text}</p>
      </Space>
    </>
  )
}
