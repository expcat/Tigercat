import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('watermark')

export default function WatermarkDemo() {
  return (
    <DemoPage
      title="Watermark 水印"
      description="gap 是透明间距。默认墨水跟正文色。图片失败会回退文字。"
      modules={modules}
    />
  )
}
