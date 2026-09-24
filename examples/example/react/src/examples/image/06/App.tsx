import { useState } from 'react'
import { Image } from '@expcat/tigercat-react/Image'
import { ImageGroup } from '@expcat/tigercat-react/ImageGroup'

export default function App() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  return (
    <ImageGroup open={open} currentIndex={index} onOpenChange={setOpen} onCurrentIndexChange={setIndex}>
      <Image src="https://picsum.photos/seed/group-a/240/160" alt="甲" />
      <Image
        src="https://picsum.photos/seed/group-missing/240/160"
        fallbackSrc="https://picsum.photos/seed/group-b/240/160"
        alt="乙"
      />
    </ImageGroup>
  )
}
