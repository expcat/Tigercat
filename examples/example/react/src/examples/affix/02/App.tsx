import { useState } from 'react'
import { Affix } from '@expcat/tigercat-react/Affix'

export default function App() {
  const [affixed, setAffixed] = useState(false)

  return (
    <div id="affix-bottom-container" className="h-40 overflow-auto rounded border p-4">
      <div className="h-96">
        <p className="mb-8 text-sm text-gray-500">在容器内滚动，元素会固定到容器底部。</p>
        <Affix offsetBottom={8} target="#affix-bottom-container" onChange={setAffixed}>
          <div className="inline-block rounded bg-emerald-600 px-4 py-2 text-white">
            {affixed ? '已固定到底部' : '待固定'}
          </div>
        </Affix>
      </div>
    </div>
  )
}
