import { useState } from 'react'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Mentions } from '@expcat/tigercat-react/Mentions'

const users = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' }
]

export default function App() {
  const [value, setValue] = useState('hello @')

  return (
    <div className="w-full max-w-lg space-y-4">
      <FormItem label="字数与清空">
        <Mentions
          value={value}
          onChange={setValue}
          options={users}
          maxLength={80}
          showCount
          clearable
          placeholder="输入 @ 提及；可清空"
        />
      </FormItem>
      <FormItem label="只读">
        <Mentions value="已锁定 @zhangsan " options={users} readOnly />
      </FormItem>
    </div>
  )
}
