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
        <FormItem label="基础自动高度">
          <Textarea
            value={autoResizeText}
            onInput={(e) => setAutoResizeText(e.currentTarget.value)}
            autoResize
            placeholder="输入内容后将自动调整高度"
          />
        </FormItem>
        <FormItem label="限制行数 (3-8)">
          <Textarea autoResize minRows={3} maxRows={8} placeholder="最少 3 行，最多 8 行" />
        </FormItem>
      </Space>
    </>
  )
}
