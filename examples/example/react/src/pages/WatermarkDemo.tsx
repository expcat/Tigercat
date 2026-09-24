import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('watermark')

export default function WatermarkDemo() {
  return (
    <DemoPage
      title="Watermark 水印"
      description="平铺水印。行距、密度和打印可见性只改样式变量，不重绘画布。"
      modules={modules}
    />
  )
}
