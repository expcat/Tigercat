import { useState } from 'react'
import { ImageAnnotation } from '@expcat/tigercat-react/ImageAnnotation'
import type { ImageAnnotation as Annotation } from '@expcat/tigercat-core'

const initialAnnotations: Annotation[] = [
  {
    id: 'region-1',
    type: 'rectangle',
    x: 0.12,
    y: 0.18,
    width: 0.22,
    height: 0.2,
    label: '入口',
    color: '#2563eb'
  }
]

export default function App() {
  const [annotations, setAnnotations] = useState(initialAnnotations)

  return (
    <ImageAnnotation
      src="https://picsum.photos/seed/annotation/900/600"
      value={annotations}
      onChange={setAnnotations}
      tools={['select', 'rectangle', 'ellipse', 'polygon', 'freehand']}
      defaultTool="rectangle"
    />
  )
}
