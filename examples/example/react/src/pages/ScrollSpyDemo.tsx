import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('scroll-spy')

export default function ScrollSpyDemo() {
  return (
    <DemoPage
      title="ScrollSpy 滚动监听"
      description="监听内容滚动并自动高亮当前导航项，适合文档目录、长表单和设置页。"
      modules={modules}
    />
  )
}
