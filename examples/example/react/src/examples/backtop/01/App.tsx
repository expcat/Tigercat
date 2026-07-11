import { useState } from 'react'
import { BackTop } from '@expcat/tigercat-react/BackTop'

export default function App() {
  const [clicks, setClicks] = useState(0)

  return (
    <div className="min-h-[720px] rounded border p-4">
      <p>向下滚动后使用回到顶部按钮。</p>
      <p className="mt-2 text-sm text-gray-500">点击次数：{clicks}</p>
      <BackTop visibilityHeight={120} onClick={() => setClicks((value) => value + 1)} />
    </div>
  )
}
