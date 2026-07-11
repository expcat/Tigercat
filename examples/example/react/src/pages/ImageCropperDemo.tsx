import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('image-cropper')

export default function ImageCropperDemo() {
  return (
    <DemoPage
      title="ImageCropper 图片裁剪"
      description="交互式图片裁剪组件，支持自由裁剪、固定宽高比、辅助线、Canvas 输出。"
      modules={modules}
    />
  )
}
