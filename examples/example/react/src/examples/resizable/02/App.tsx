import { useState, useCallback } from 'react'
import { Resizable } from '@expcat/tigercat-react/Resizable'

export default function App() {
  const [size, setSize] = useState({ width: 300, height: 150 })

  const onResize = useCallback((e: { width: number; height: number }) => {
    setSize({ width: Math.round(e.width), height: Math.round(e.height) })
  }, [])

  return (
    <>
      <div className="flex gap-8">
        <Resizable defaultWidth={200} defaultHeight={200} lockAspectRatio>
          <div className="w-full h-full bg-green-50 border border-green-200 rounded flex items-center justify-center text-sm">
            lockAspectRatio
          </div>
        </Resizable>
        <Resizable defaultWidth={200} defaultHeight={100} axis="horizontal">
          <div className="w-full h-full bg-amber-50 border border-amber-200 rounded flex items-center justify-center text-sm">
            axis="horizontal"
          </div>
        </Resizable>
      </div>
    </>
  )
}
