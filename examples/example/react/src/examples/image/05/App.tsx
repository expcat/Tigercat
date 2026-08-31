import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { ImagePreview } from '@expcat/tigercat-react/ImagePreview'

const photos = [
  { src: 'https://picsum.photos/seed/tiger-preview-1/800/600', alt: '林间小径' },
  { src: 'https://picsum.photos/seed/tiger-preview-2/800/600', alt: '湖面倒影' },
  { src: 'https://picsum.photos/seed/tiger-preview-3/800/600', alt: '山脊云雾' }
]

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>打开图片预览</Button>
      <ImagePreview open={open} images={photos} currentIndex={1} onOpenChange={setOpen} />
    </>
  )
}
