import { Gantt } from '@expcat/tigercat-react/Gantt'
import type { GanttTask } from '@expcat/tigercat-core'

const tasks: GanttTask[] = [
  { id: 'research', label: '需求调研', start: '2026-01-01', end: '2026-01-07', progress: 100 },
  {
    id: 'design',
    label: '交互设计',
    start: '2026-01-08',
    end: '2026-01-15',
    progress: 75,
    dependencies: ['research']
  },
  {
    id: 'build',
    label: '功能开发',
    start: '2026-01-16',
    end: '2026-02-05',
    progress: 45,
    dependencies: ['design']
  }
]

export default function App() {
  return <Gantt data={tasks} />
}
