import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('kanban')

export default function KanbanDemo() {
  return (
    <DemoPage
      title="Kanban 看板"
      description="可拖拽的看板面板，支持卡片和列拖拽排序。"
      modules={modules}
    />
  )
}
