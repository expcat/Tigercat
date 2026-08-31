import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { ImageViewer } from '@expcat/tigercat-react/ImageViewer'

const images = [
  { src: 'https://picsum.photos/seed/tiger-viewer-1/800/600', alt: '林间小径' },
  { src: 'https://picsum.photos/seed/tiger-viewer-2/800/600', alt: '湖面倒影' },
  { src: 'https://picsum.photos/seed/tiger-viewer-3/800/600', alt: '山脊云雾' }
]

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>查看图片</Button>
      <ImageViewer
        open={open}
        images={images}
        currentIndex={1}
        showNav={false}
        onOpenChange={setOpen}
      />
    </>
  )
}
