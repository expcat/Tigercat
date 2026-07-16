import { useState } from 'react'
import { ImageAnnotation } from '@expcat/tigercat-react/ImageAnnotation'
import type { ImageAnnotation as Annotation, ImageAnnotationTool } from '@expcat/tigercat-core'

const tools: ImageAnnotationTool[] = ['select', 'rectangle', 'ellipse', 'polygon', 'freehand']

const initialAnnotations: Annotation[] = [
  {
    id: 'entrance',
    type: 'rectangle',
    x: 0.1,
    y: 0.18,
    width: 0.24,
    height: 0.28,
    label: '入口',
    color: '#2563eb'
  },
  {
    id: 'work-area',
    type: 'ellipse',
    x: 0.56,
    y: 0.26,
    width: 0.25,
    height: 0.3,
    label: '工作区',
    color: '#16a34a'
  }
]

export default function App() {
  const [annotations, setAnnotations] = useState(initialAnnotations)
  const [tool, setTool] = useState<ImageAnnotationTool>('select')
  const [selectedId, setSelectedId] = useState('entrance')
  const [readOnly, setReadOnly] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
        <label className="grid gap-1 text-sm">
          <span>受控工具</span>
          <select
            className="rounded border border-gray-300 bg-white px-2 py-1.5 dark:border-gray-600 dark:bg-gray-900"
            value={tool}
            disabled={readOnly}
            onChange={(event) => setTool(event.target.value as ImageAnnotationTool)}>
            {tools.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          <span>受控选区</span>
          <select
            className="rounded border border-gray-300 bg-white px-2 py-1.5 dark:border-gray-600 dark:bg-gray-900"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}>
            <option value="">无</option>
            {annotations.map((annotation) => (
              <option key={annotation.id} value={annotation.id}>
                {annotation.label ?? annotation.id}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 pb-1.5 text-sm">
          <input
            type="checkbox"
            checked={readOnly}
            onChange={(event) => setReadOnly(event.target.checked)}
          />
          只读模式
        </label>
      </div>

      <ImageAnnotation
        src="https://picsum.photos/seed/annotation-controlled/900/600"
        value={annotations}
        tool={tool}
        selectedId={selectedId}
        readonly={readOnly}
        tools={tools}
        onChange={setAnnotations}
        onToolChange={setTool}
        onSelect={(annotation) => setSelectedId(annotation?.id ?? '')}
      />

      <p className="text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
        当前工具：{tool}；当前选区：{selectedId || '无'}；{readOnly ? '只读' : '可编辑'}。
      </p>
    </div>
  )
}
