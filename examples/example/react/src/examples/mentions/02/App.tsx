import { useState } from 'react'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Mentions } from '@expcat/tigercat-react/Mentions'

const topics = [
  { label: '前端', value: 'frontend' },
  { label: '设计系统', value: 'design-system' },
  { label: '可访问性', value: 'a11y', disabled: true }
]

export default function App() {
  const [value, setValue] = useState('')

  return (
    <FormItem label="话题" className="w-full max-w-lg">
      <Mentions
        value={value}
        onChange={setValue}
        options={topics}
        prefix="#"
        placeholder="输入 # 添加话题（可访问性不可选）"
      />
    </FormItem>
  )
}
