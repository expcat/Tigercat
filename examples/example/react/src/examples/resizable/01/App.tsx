import { useState, useCallback } from 'react'
import { Resizable } from '@expcat/tigercat-react/Resizable'

export default function App() {
  const [size, setSize] = useState({ width: 300, height: 150 })

  const onResize = useCallback((e: { width: number; height: number }) => {
    setSize({ width: Math.round(e.width), height: Math.round(e.height) })
  }, [])

  return (
    <>
      <Resizable
        defaultWidth={300}
        defaultHeight={150}
        minWidth={100}
        minHeight={60}
        onResize={onResize}>
        <div className="w-full h-full bg-blue-50 border border-blue-200 rounded flex items-center justify-center text-sm text-blue-600">
          {size.width} × {size.height}
        </div>
      </Resizable>
    </>
  )
}
