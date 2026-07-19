import { TagsInput } from '@expcat/tigercat-react/TagsInput'

export default function App() {
  return (
    <div className="w-full max-w-md space-y-2">
      <TagsInput defaultValue={['vue', 'react']} max={5} placeholder="回车添加，最多 5 个" />
      <p className="text-sm text-gray-600 dark:text-gray-300">
        非受控；输入后回车创建，退格删除，达到上限拒绝添加。
      </p>
    </div>
  )
}
