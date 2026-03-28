import { useState, useCallback } from 'react'
import { Resizable } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Resizable defaultWidth={300} defaultHeight={150} minWidth={100} minHeight={60} onResize={onResize}>
  <div>{width} × {height}</div>
</Resizable>`

const constrainedSnippet = `<Resizable defaultWidth={200} defaultHeight={200} lockAspectRatio>...</Resizable>
<Resizable defaultWidth={200} defaultHeight={100} axis="horizontal">...</Resizable>`

const disabledSnippet = `<Resizable defaultWidth={200} defaultHeight={100} disabled>...</Resizable>`

const ResizableDemo: React.FC = () => {
  const [size, setSize] = useState({ width: 300, height: 150 })

  const onResize = useCallback((e: { width: number; height: number }) => {
    setSize({ width: Math.round(e.width), height: Math.round(e.height) })
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Resizable 可调整大小容器</h1>
      <p className="text-gray-500 mb-8">拖拽手柄改变元素尺寸，支持锁定宽高比和约束范围。</p>

      <DemoBlock title="基础用法" description="拖拽右下角手柄" code={basicSnippet}>
        <Resizable defaultWidth={300} defaultHeight={150} minWidth={100} minHeight={60} onResize={onResize}>
          <div className="w-full h-full bg-blue-50 border border-blue-200 rounded flex items-center justify-center text-sm text-blue-600">
            {size.width} × {size.height}
          </div>
        </Resizable>
      </DemoBlock>

      <DemoBlock title="锁定宽高比 & 单轴" code={constrainedSnippet}>
        <div className="flex gap-8">
          <Resizable defaultWidth={200} defaultHeight={200} lockAspectRatio>
            <div className="w-full h-full bg-green-50 border border-green-200 rounded flex items-center justify-center text-sm">lockAspectRatio</div>
          </Resizable>
          <Resizable defaultWidth={200} defaultHeight={100} axis="horizontal">
            <div className="w-full h-full bg-amber-50 border border-amber-200 rounded flex items-center justify-center text-sm">axis="horizontal"</div>
          </Resizable>
        </div>
      </DemoBlock>

      <DemoBlock title="禁用" code={disabledSnippet}>
        <Resizable defaultWidth={200} defaultHeight={100} disabled>
          <div className="w-full h-full bg-gray-100 border rounded flex items-center justify-center text-sm text-gray-400">禁用状态</div>
        </Resizable>
      </DemoBlock>
    </div>
  )
}

export default ResizableDemo
