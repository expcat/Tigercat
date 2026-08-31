import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { ImageViewer } from '@expcat/tigercat-react/ImageViewer'

const images = [
  { src: 'https://picsum.photos/seed/tiger-controlled-viewer-1/800/600', alt: '林间小径' },
  { src: 'https://picsum.photos/seed/tiger-controlled-viewer-2/800/600', alt: '湖面倒影' },
  { src: 'https://picsum.photos/seed/tiger-controlled-viewer-3/800/600', alt: '山脊云雾' }
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
    if (!nextOpen) {
      setStatus(`查看器已从第 ${currentIndex + 1} 张图片关闭`)
    }
  }

  const handleCurrentIndexChange = (nextIndex: number) => {
    setCurrentIndex(nextIndex)
    setStatus(`已切换到第 ${nextIndex + 1} 张图片`)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="选择要查看的图片">
        {images.map((image, index) => (
          <Button
            key={image.src}
            size="sm"
            variant={currentIndex === index ? 'primary' : 'secondary'}
            onClick={() => openImage(index)}>
            打开 {image.alt}
          </Button>
        ))}
      </div>

      <p className="text-sm text-[var(--tiger-text-secondary,#6b7280)]" aria-live="polite">
        {status}；缩放范围 0.75×–2×，遮罩点击不会关闭。切图后缩放回到 1。
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
      />
    </div>
  )
}
