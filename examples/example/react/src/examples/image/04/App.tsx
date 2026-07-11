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
      <div className="flex gap-4">
        <Image
          src={PHOTOS[2]}
          width={200}
          height={150}
          lazy
          alt="懒加载"
          preview={false}
          placeholderRender={
            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm animate-pulse rounded">
              加载中…
            </div>
          }
        />
      </div>
    </>
  )
}
