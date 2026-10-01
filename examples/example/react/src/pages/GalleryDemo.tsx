import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('gallery')

export default function GalleryDemo() {
  return (
    <DemoPage
      title="Gallery 画廊"
      description="缩略图导航、当前项计数与图片预览。"
      modules={modules}
    />
  )
}
