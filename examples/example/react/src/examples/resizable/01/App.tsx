import { useState, useCallback } from 'react'
import { Resizable } from '@expcat/tigercat-react/Resizable'

export default function App() {
  const [size, setSize] = useState({ width: 300, height: 150 })

  const onResize = useCallback((e: { width: number; height: number }) => {
    setSize({ width: Math.round(e.width), height: Math.round(e.height) })
  }, [])

  return (
    <Resizable
      defaultWidth={300}
      defaultHeight={150}
      minWidth={100}
      minHeight={60}
      handles={['left', 'right', 'bottom', 'bottom-right']}
      onResize={onResize}>
      <div className="flex h-full w-full items-center justify-center rounded border border-blue-200 bg-blue-50 text-sm text-blue-600">
        {size.width} × {size.height}
      </div>
    </Resizable>
  )
}
