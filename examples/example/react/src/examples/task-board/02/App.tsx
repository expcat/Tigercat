import { useState } from 'react'
import { TaskBoard } from '@expcat/tigercat-react/TaskBoard'
import type {
  TaskBoardCard,
  TaskBoardColumn,
  TaskBoardColumnMoveEvent
} from '@expcat/tigercat-core'

const initialColumns: TaskBoardColumn[] = [
  {
    id: 'backlog',
    title: '待规划',
    cards: [
      {
        id: 1,
        title: '补齐筛选示例',
        description: '展示标题与描述搜索',
        priority: '高',
        owner: 'Lin'
      },
      {
        id: 2,
        title: '整理主题文档',
        description: '核对暗色模式说明',
        priority: '中',
        owner: 'Mia'
      }
    ]
  },
  {
    id: 'doing',
    title: '进行中',
    cards: [
      {
        id: 3,
        title: '运行发布门禁',
        description: '验证示例构建和分组测试',
        priority: '高',
        owner: 'Kai'
      }
    ]
  },
  {
    id: 'done',
    title: '已完成',
    cards: [
      {
        id: 4,
        title: '发布 v2.0.4',
        description: '包与 tag 已同步',
        priority: '低',
        owner: 'Yun'
      }
    ]
  }
]

const renderCard = (card: TaskBoardCard) => (
  <div className="space-y-2">
    <div className="font-medium">{card.title}</div>
    <p className="text-xs text-gray-500">{card.description}</p>
    <div className="flex items-center justify-between text-xs">
      <span className="rounded bg-orange-100 px-2 py-0.5 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
        {String(card.priority ?? '普通')}优先级
      </span>
      <span className="text-gray-500">{String(card.owner ?? '未分配')}</span>
    </div>
  </div>
)

export default function App() {
  const [columns, setColumns] = useState(initialColumns)
  const [filterText, setFilterText] = useState('')
  const [moveStatus, setMoveStatus] = useState('拖动列标题可调整顺序')

  const handleColumnMove = (event: TaskBoardColumnMoveEvent) => {
    setMoveStatus(`列 ${String(event.columnId)}：${event.fromIndex + 1} → ${event.toIndex + 1}`)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          过滤卡片
          <input
            value={filterText}
            className="rounded border border-gray-300 bg-transparent px-3 py-1.5 dark:border-gray-600"
            placeholder="例如：发布"
            onChange={(event) => setFilterText(event.target.value)}
          />
        </label>
        <span className="text-sm text-gray-500" aria-live="polite">
          {moveStatus}
        </span>
      </div>

      <TaskBoard
        columns={columns}
        filterText={filterText}
        columnDraggable
        showCardCount
        renderCard={renderCard}
        onColumnsChange={setColumns}
        onColumnMove={handleColumnMove}
      />
    </div>
  )
}
