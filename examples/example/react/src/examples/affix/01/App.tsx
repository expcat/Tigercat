import { useState } from 'react'
import { Affix } from '@expcat/tigercat-react/Affix'

export default function App() {
  const [affixed, setAffixed] = useState(false)

  return (
    <div id="affix-demo-container" className="h-40 overflow-auto rounded border p-4">
      <div className="h-96">
        <p className="mb-8 text-sm text-gray-500">向下滚动触发固定。</p>
        <Affix offsetTop={8} target="#affix-demo-container" onChange={setAffixed}>
          <div className="inline-block rounded bg-blue-600 px-4 py-2 text-white">
            {affixed ? '已固定' : '待固定'}
          </div>
        </Affix>
      </div>
    </div>
  )
}
