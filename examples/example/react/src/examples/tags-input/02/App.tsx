import { useState } from 'react'
import { TagsInput } from '@expcat/tigercat-react/TagsInput'

export default function App() {
  const [tags, setTags] = useState<string[]>(['alpha'])

  return (
    <div className="w-full max-w-md space-y-2">
      <TagsInput
        value={tags}
        onChange={setTags}
        delimiters={[',', ';']}
        beforeAdd={(tag) => tag.toLowerCase()}
        placeholder="逗号/分号或回车分隔，自动小写"
      />
      <p className="text-sm text-gray-600 dark:text-gray-300">当前：{tags.join(' · ') || '暂无'}</p>
    </div>
  )
}
