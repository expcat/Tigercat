import { useState, useCallback } from 'react'
import { Resizable } from '@expcat/tigercat-react/Resizable'

export default function App() {
  const [size, setSize] = useState({ width: 300, height: 150 })

  const onResize = useCallback((e: { width: number; height: number }) => {
    setSize({ width: Math.round(e.width), height: Math.round(e.height) })
  }, [])

  return (
    <>
      <Resizable defaultWidth={200} defaultHeight={100} disabled>
        <div className="w-full h-full bg-gray-100 border rounded flex items-center justify-center text-sm text-gray-400">
          禁用状态
        </div>
      </Resizable>
    </>
  )
}
