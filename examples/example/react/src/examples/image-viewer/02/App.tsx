import { Button } from '@expcat/tigercat-react/Button'
import { useState } from 'react'
import { ImageViewer } from '@expcat/tigercat-react/ImageViewer'

const images = [
  'https://picsum.photos/800/600?random=1',
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/800/600?random=3',
  'https://picsum.photos/800/600?random=4'
]

export default function App() {
  const [open, setOpen] = useState(false)

  const [open2, setOpen2] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen2(true)}>打开查看器（第2张）</Button>
      <ImageViewer
        open={open2}
        onClose={() => setOpen2(false)}
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
