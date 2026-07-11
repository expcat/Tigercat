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
      <div className="flex gap-4 items-start">
        <div className="text-center">
          <Image
            src="/broken.jpg"
            fallbackSrc={PHOTOS[0]}
            width={150}
            height={100}
            alt="回退示例"
            preview={false}
          />
          <p className="text-xs text-gray-500 mt-1">fallbackSrc 回退</p>
        </div>
        <div className="text-center">
          <Image
            src="/broken.jpg"
            width={150}
            height={100}
            alt="错误"
            preview={false}
            errorRender={
              <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm rounded">
                加载失败
              </div>
            }
          />
          <p className="text-xs text-gray-500 mt-1">errorRender</p>
        </div>
      </div>
    </>
  )
}
