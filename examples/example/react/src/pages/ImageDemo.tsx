import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('image')

export default function ImageDemo() {
  return (
    <DemoPage
      title="Image 图片"
      description="默认可键盘预览、懒加载、失败回退、悬停放大、组图连续切换。"
      modules={modules}
    />
  )
}
