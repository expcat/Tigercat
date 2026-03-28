import { useState } from 'react'
import { ImageViewer, Button } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const images = [
  'https://picsum.photos/800/600?random=1',
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/800/600?random=3',
  'https://picsum.photos/800/600?random=4'
]

const basicSnippet = `<Button onClick={() => setOpen(true)}>查看图片</Button>
<ImageViewer open={open} onClose={() => setOpen(false)} images={images} />`

const featureSnippet = `<Button onClick={() => setOpen2(true)}>打开查看器（第2张）</Button>
<ImageViewer
  open={open2}
  onClose={() => setOpen2(false)}
  images={images}
  currentIndex={1}
  zoomable
  rotatable
  showNav
  showCounter
/>`

const ImageViewerDemo: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [open2, setOpen2] = useState(false)

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">ImageViewer 图片查看器</h1>
      <p className="text-gray-500 mb-8">全屏图片预览，支持缩放、旋转和多图切换。</p>

      <DemoBlock title="基本用法" description="点击按钮打开图片查看器" code={basicSnippet}>
        <Button onClick={() => setOpen(true)}>查看图片</Button>
        <ImageViewer open={open} onClose={() => setOpen(false)} images={images} />
      </DemoBlock>

      <DemoBlock title="全部功能" description="缩放、旋转、导航按钮和计数器" code={featureSnippet}>
        <Button onClick={() => setOpen2(true)}>打开查看器（第2张）</Button>
        <ImageViewer
          open={open2}
          onClose={() => setOpen2(false)}
          images={images}
          currentIndex={1}
          zoomable
          rotatable
          showNav
          showCounter />
      </DemoBlock>
    </div>
  )
}

export default ImageViewerDemo
