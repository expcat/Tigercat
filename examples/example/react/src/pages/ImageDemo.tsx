import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('image')

export default function ImageDemo() {
  return (
    <DemoPage
      title="Image 图片"
      description="图片展示组件，支持适配模式、懒加载、错误回退、点击预览、多图组预览。"
      modules={modules}
    />
  )
}
