import { useState } from 'react'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Mentions } from '@expcat/tigercat-react/Mentions'

const users = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' }
]

export default function App() {
  const [value, setValue] = useState('')

  return (
    <div className="w-full max-w-lg space-y-2">
      <FormItem label="提及成员">
        <Mentions value={value} onChange={setValue} options={users} placeholder="输入 @ 提及成员" />
      </FormItem>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        搜「张」或「zhang」都能出张三；选中插入 <code>@zhangsan</code>。当前：{value || '暂无'}
      </p>
    </div>
  )
}
