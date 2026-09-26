import { useState } from 'react'
import { Affix } from '@expcat/tigercat-react/Affix'

export default function App() {
  const [affixed, setAffixed] = useState(false)

  return (
    <div
      id="affix-bottom-container"
      className="h-40 overflow-auto rounded border p-4 text-sm text-gray-500">
      <p>上方内容。标签的文档位置在容器底边之下，所以会钉在底部。</p>
      <div className="h-40" />
      <Affix offsetBottom={8} target="#affix-bottom-container" onChange={setAffixed}>
        <div className="inline-block rounded bg-emerald-600 px-4 py-2 text-white">
          {affixed ? '已固定到底部' : '已回到文档流'}
        </div>
      </Affix>
      <p className="mt-6">滚到标签的文档位置后，它离开底边，回到这段文字旁边。</p>
      <div className="h-40" />
    </div>
  )
}
