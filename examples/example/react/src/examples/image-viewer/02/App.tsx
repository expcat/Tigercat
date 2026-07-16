import { useState } from 'react'
import { ImageViewer } from '@expcat/tigercat-react/ImageViewer'

const images = [
  'https://picsum.photos/seed/tiger-controlled-viewer-1/800/600',
  'https://picsum.photos/seed/tiger-controlled-viewer-2/800/600',
  'https://picsum.photos/seed/tiger-controlled-viewer-3/800/600'
]

export default function App() {
  const [open, setOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [status, setStatus] = useState('选择一张图片打开查看器')

  const openImage = (index: number) => {
    setCurrentIndex(index)
    setOpen(true)
    setStatus(`已打开第 ${index + 1} 张图片`)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
  }

  const handleCurrentIndexChange = (nextIndex: number) => {
    setCurrentIndex(nextIndex)
    setStatus(`已切换到第 ${nextIndex + 1} 张图片`)
  }

  const handleClose = () => {
    setStatus(`查看器已从第 ${currentIndex + 1} 张图片关闭`)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="选择要查看的图片">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`rounded px-3 py-1.5 text-sm ${
              currentIndex === index
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 dark:border-gray-600'
            }`}
            aria-pressed={currentIndex === index}
            onClick={() => openImage(index)}>
            打开图片 {index + 1}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500" aria-live="polite">
        {status}；缩放范围 0.75×–2×，遮罩点击不会关闭。
      </p>

      <ImageViewer
        images={images}
        open={open}
        currentIndex={currentIndex}
        minZoom={0.75}
        maxZoom={2}
        maskClosable={false}
        onOpenChange={handleOpenChange}
        onCurrentIndexChange={handleCurrentIndexChange}
        onClose={handleClose}
      />
    </div>
  )
}
