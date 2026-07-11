import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('image-viewer')

export default function ImageViewerDemo() {
  return (
    <DemoPage
      title="ImageViewer 图片查看器"
      description="全屏图片预览，支持缩放、旋转和多图切换。"
      modules={modules}
    />
  )
}
