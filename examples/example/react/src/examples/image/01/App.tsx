import { ImageGroup } from '@expcat/tigercat-react/ImageGroup'
import { ImagePreview } from '@expcat/tigercat-react/ImagePreview'
import { useState } from 'react'
import { Image } from '@expcat/tigercat-react/Image'

const PHOTOS = [
  'https://picsum.photos/seed/tiger1/600/400',
  'https://picsum.photos/seed/tiger2/600/400',
  'https://picsum.photos/seed/tiger3/600/400',
  'https://picsum.photos/seed/tiger4/600/400',
  'https://picsum.photos/seed/tiger5/600/400',
  'https://picsum.photos/seed/tiger6/600/400'
]

const FIT_MODES = ['contain', 'cover', 'fill', 'none', 'scale-down'] as const

export default function App() {
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <>
      <div className="flex gap-4 flex-wrap">
        <Image src={PHOTOS[0]} alt="示例图片" width={200} height={150} preview={false} />
        <Image src={PHOTOS[1]} alt="示例图片 2" width={200} height={150} preview={false} />
      </div>
    </>
  )
}
