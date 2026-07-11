import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('watermark')

export default function WatermarkDemo() {
  return (
    <DemoPage
      title="Watermark 水印"
      description="在页面上添加水印，支持文字和图片，防止信息泄露。"
      modules={modules}
    />
  )
}
