import { useState } from 'react'
import { Gantt } from '@expcat/tigercat-react/Gantt'
import type { GanttScale, GanttTask } from '@expcat/tigercat-core'

const tasks: GanttTask[] = [
  { id: 'research', label: '需求调研', start: '2026-01-02', end: '2026-01-08', progress: 100 },
  {
    id: 'design',
    label: '交互设计',
    start: '2026-01-07',
    end: '2026-01-16',
    progress: 80,
    dependencies: ['research']
  },
  {
    id: 'build',
    label: '功能开发',
    start: '2026-01-14',
    end: '2026-01-27',
    progress: 45,
    dependencies: ['design']
  }
]

const scaleOptions: Array<{ value: GanttScale; label: string }> = [
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' }
]

const formatDate = (date: Date, scale: GanttScale) => {
  if (scale === 'month') return `${date.getMonth() + 1}月`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export default function App() {
  const [scale, setScale] = useState<GanttScale>('week')
  const [selectedId, setSelectedId] = useState<string | number | null>('design')
  const [selectionStatus, setSelectionStatus] = useState('已选择：交互设计')

  const handleSelectedIdChange = (nextId: string | number | null) => {
    setSelectedId(nextId)
    const selectedTask = tasks.find((task) => task.id === nextId)
    setSelectionStatus(selectedTask ? `已选择：${selectedTask.label}` : '已清除选择')
  }

  return (
    <div className="space-y-4 overflow-x-auto">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2" role="group" aria-label="甘特图时间刻度">
          {scaleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`rounded px-3 py-1.5 text-sm ${
                scale === option.value
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 dark:border-gray-600'
              }`}
              aria-pressed={scale === option.value}
              onClick={() => setScale(option.value)}>
              {option.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500" aria-live="polite">
          {selectionStatus}
        </span>
      </div>

      <Gantt
        data={tasks}
        width={860}
        height={280}
        scale={scale}
        minDate="2026-01-01"
        maxDate="2026-02-01"
        dateFormatter={formatDate}
        selectable
        selectedId={selectedId}
        onSelectedIdChange={handleSelectedIdChange}
        title="R34 delivery plan"
        desc="Switchable time scale with controlled task selection"
      />
    </div>
  )
}
