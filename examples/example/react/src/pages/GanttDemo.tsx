import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('gantt')

export default function GanttDemo() {
  return (
    <DemoPage
      title="Gantt 甘特图"
      description="用 SVG 时间轴展示任务排期、进度和依赖关系。"
      modules={modules}
    />
  )
}
