import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { ImageViewer } from '@expcat/tigercat-react/ImageViewer'

const images = [
  'https://picsum.photos/seed/tiger-viewer-1/800/600',
  'https://picsum.photos/seed/tiger-viewer-2/800/600',
  'https://picsum.photos/seed/tiger-viewer-3/800/600'
]

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>查看图片</Button>
      <ImageViewer
        open={open}
        onClose={() => setOpen(false)}
        images={images}
        currentIndex={1}
        zoomable
        rotatable
        showNav
        showCounter
      />
    </>
  )
}
