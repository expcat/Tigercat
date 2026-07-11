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
        <FormItem label="2行">
          <Textarea placeholder="2行文本域" rows={2} />
        </FormItem>
        <FormItem label="4行">
          <Textarea placeholder="4行文本域" rows={4} />
        </FormItem>
        <FormItem label="6行">
          <Textarea placeholder="6行文本域" rows={6} />
        </FormItem>
      </Space>
    </>
  )
}
