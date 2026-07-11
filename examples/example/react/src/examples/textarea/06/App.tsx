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
        <FormItem label="禁用">
          <Textarea value="禁用的文本域" disabled rows={3} />
        </FormItem>
        <FormItem label="只读">
          <Textarea value="只读的文本域" readonly rows={3} />
        </FormItem>
        <FormItem label="必填">
          <Textarea placeholder="必填的文本域" required rows={3} />
        </FormItem>
      </Space>
    </>
  )
}
