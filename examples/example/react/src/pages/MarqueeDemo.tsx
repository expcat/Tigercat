import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('marquee')

export default function MarqueeDemo() {
  return (
    <DemoPage
      title="Marquee 跑马灯"
      description="循环滚动子内容。可选边缘渐隐不接收点击。不传名字时不是地标。减少动效时暂停。"
      modules={modules}
    />
  )
}
