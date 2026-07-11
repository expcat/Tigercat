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
        <FormItem label="Small">
          <Textarea size="sm" placeholder="Small textarea" />
        </FormItem>
        <FormItem label="Medium">
          <Textarea size="md" placeholder="Medium textarea" />
        </FormItem>
        <FormItem label="Large">
          <Textarea size="lg" placeholder="Large textarea" />
        </FormItem>
      </Space>
    </>
  )
}
