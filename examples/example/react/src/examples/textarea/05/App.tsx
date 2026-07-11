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
        <FormItem label="仅计数">
          <Textarea showCount placeholder="显示字符数" />
        </FormItem>
        <FormItem label="限制最大长度 (100)">
          <Textarea
            value={limited}
            onInput={(e) => setLimited(e.currentTarget.value)}
            showCount
            maxLength={100}
            placeholder="最多 100 个字符"
          />
        </FormItem>
      </Space>
    </>
  )
}
