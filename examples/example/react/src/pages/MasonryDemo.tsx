import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('masonry')

export default function MasonryDemo() {
  return (
    <DemoPage
      title="Masonry 瀑布流"
      description="响应式列数与间距的瀑布流布局，动态插入自动重排。"
      modules={modules}
    />
  )
}
