import { useState } from 'react'
import { ImageAnnotation } from '@expcat/tigercat-react/ImageAnnotation'
import type { ImageAnnotation as ImageAnnotationItem } from '@expcat/tigercat-core'

const PHOTO = 'https://picsum.photos/seed/annotation/900/600'

const initialAnnotations: ImageAnnotationItem[] = [
  {
    id: 'region-1',
    type: 'rectangle',
    x: 0.12,
    y: 0.18,
    width: 0.22,
    height: 0.2,
    label: '入口',
    color: '#2563eb'
  },
  {
    id: 'region-2',
    type: 'ellipse',
    x: 0.56,
    y: 0.28,
    width: 0.18,
    height: 0.22,
    label: '目标',
    color: '#dc2626'
  }
]

export default function App() {
  const [annotations, setAnnotations] = useState<ImageAnnotationItem[]>(initialAnnotations)

  const [selected, setSelected] = useState<ImageAnnotationItem | null>(null)

  return (
    <>
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">受控标注</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            通过 value / onChange 管理标注数据，切换工具后在图片上拖拽绘制。
          </p>
          <div className="space-y-4">
            <ImageAnnotation
              src={PHOTO}
              value={annotations}
              defaultTool="rectangle"
              onChange={(next) => setAnnotations(next)}
              onSelect={(annotation) => setSelected(annotation)}
            />
            <div className="rounded border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              标注数量：{annotations.length}
              {selected ? `，当前选择：${selected.label ?? selected.id}` : '，未选择标注'}
            </div>
          </div>
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">多形状工具</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            内置 select、rectangle、ellipse、polygon、freehand 工具；多边形可用双击或 Enter 完成。
          </p>
          <ImageAnnotation
            src={PHOTO}
            tools={['select', 'rectangle', 'ellipse', 'polygon', 'freehand']}
            defaultValue={initialAnnotations}
          />
        </section>
      </div>
    </>
  )
}
