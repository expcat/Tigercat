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
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 flex-wrap">
          {PHOTOS.slice(0, 4).map((src, i) => (
            <Image key={i} src={src} width={120} height={80} alt="点击预览" />
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">悬停预览：</span>
          <Image src={PHOTOS[0]} width={120} height={80} previewTrigger="hover" alt="悬停预览" />
        </div>
      </div>
    </>
  )
}
