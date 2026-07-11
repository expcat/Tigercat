import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('task-board')

export default function TaskBoardDemo() {
  return (
    <DemoPage
      title="TaskBoard 任务看板"
      description="可拖拽的任务看板，支持卡片跨列流转、列排序、WIP 限制等。"
      modules={modules}
    />
  )
}
