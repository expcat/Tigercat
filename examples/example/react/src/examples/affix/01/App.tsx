import { useState } from 'react'
import { Affix } from '@expcat/tigercat-react/Affix'

export default function App() {
  const [affixed, setAffixed] = useState(false)

  return (
    <div className="min-h-[720px]">
      <Affix offsetTop={0} onChange={setAffixed}>
        <div className="w-full rounded bg-blue-600 px-4 py-2 text-white">
          {affixed ? '顶栏已固定（宽度跟占位走）' : '视口顶栏'}
        </div>
      </Affix>
      <p className="mt-8 text-sm text-gray-500">
        向下滚动，顶栏钉在视口顶部；父级变宽时占位仍铺满。
      </p>
    </div>
  )
}
