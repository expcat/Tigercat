import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('carousel')

export default function CarouselDemo() {
  return (
    <DemoPage
      title="Carousel 轮播图"
      description="轮播组件，用于展示图片、卡片等内容。"
      modules={modules}
    />
  )
}
