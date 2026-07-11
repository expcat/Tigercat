import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('print-layout')

export default function PrintLayoutDemo() {
  return (
    <DemoPage
      title="PrintLayout 打印布局"
      description="用于预览和打印的页面布局组件，支持 A4/Letter 尺寸、页眉页脚和分页。"
      modules={modules}
    />
  )
}
