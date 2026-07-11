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
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        onClick={() => setPreviewOpen(true)}>
        打开预览
      </button>
      <ImagePreview
        open={previewOpen}
        images={PHOTOS}
        currentIndex={0}
        onOpenChange={setPreviewOpen}
      />
    </>
  )
}
