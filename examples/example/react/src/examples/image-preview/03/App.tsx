import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { ImagePreview } from '@expcat/tigercat-react/ImagePreview'

const images = [
  { src: 'https://picsum.photos/seed/tiger-flip-1/800/600', alt: '林间小径' },
  { src: 'https://picsum.photos/seed/tiger-flip-2/800/600', alt: '湖面倒影' }
]

export default function App() {
  const [open, setOpen] = useState(true)
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开预览</Button>
      <ImagePreview open={open} images={images} onOpenChange={setOpen} />
    </>
  )
}
