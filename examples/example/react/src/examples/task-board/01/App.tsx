import React, { useState } from 'react'
import { TaskBoard } from '@expcat/tigercat-react/TaskBoard'
import type {
  TaskBoardColumn,
  TaskBoardCardMoveEvent,
  TaskBoardColumnMoveEvent
} from '@expcat/tigercat-core'

const initialColumns: TaskBoardColumn[] = [
  {
    id: 'todo',
    title: '待办',
    cards: [
      { id: 1, title: '需求评审', description: '与产品经理对齐 Q2 需求' },
      { id: 2, title: '技术方案', description: '编写 TaskBoard 组件方案' },
      { id: 3, title: '环境搭建' }
    ]
  },
  {
    id: 'doing',
    title: '进行中',
    wipLimit: 3,
    cards: [
      { id: 4, title: '开发看板组件', description: '实现拖拽、列管理、样式' },
      { id: 5, title: '单元测试' }
    ]
  },
  {
    id: 'done',
    title: '已完成',
    cards: [{ id: 6, title: '项目初始化', description: '搭建 monorepo 框架' }]
  }
]

const initialSlotColumns: TaskBoardColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    cards: [
      {
        id: 's1',
        title: 'Design System',
        description: '建立设计规范',
        tag: '设计',
        priority: 'high'
      },
      {
        id: 's2',
        title: 'API 对接',
        description: '完成后端 API 集成',
        tag: '开发',
        priority: 'medium'
      }
    ]
  },
  {
    id: 'review',
    title: 'Review',
    wipLimit: 2,
    cards: [
      { id: 's3', title: 'Code Review', description: 'PR #42 审查', tag: '审查', priority: 'low' }
    ]
  }
]

const initialLabelsColumns: TaskBoardColumn[] = [
  { id: 'empty', title: '空列', cards: [] },
  { id: 'busy', title: '有卡片', cards: [{ id: 'l1', title: '示例卡片' }] }
]

export default function App() {
  const [columns, setColumns] = useState<TaskBoardColumn[]>(initialColumns)

  const [slotColumns, setSlotColumns] = useState<TaskBoardColumn[]>(initialSlotColumns)

  const [labelsColumns, setLabelsColumns] = useState<TaskBoardColumn[]>(initialLabelsColumns)

  const handleCardMove = (event: TaskBoardCardMoveEvent) => {
    console.log('card-move', event)
  }

  const handleColumnMove = (event: TaskBoardColumnMoveEvent) => {
    console.log('column-move', event)
  }

  const handleCardAdd = (columnId: string | number) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: [...col.cards, { id: Date.now(), title: `新任务 ${col.cards.length + 1}` }]
            }
          : col
      )
    )
  }

  return (
    <>
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            受控模式 + 卡片拖拽 + 列拖拽 + 新增卡片。
          </p>
          <TaskBoard
            columns={columns}
            onColumnsChange={setColumns}
            onCardMove={handleCardMove}
            onColumnMove={handleColumnMove}
            onCardAdd={handleCardAdd}
          />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义卡片</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            通过 renderCard 自定义卡片渲染。
          </p>
          <TaskBoard
            columns={slotColumns}
            onColumnsChange={setSlotColumns}
            renderCard={(card) => (
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm">{card.title}</span>
                <span className="text-xs opacity-60">{String(card.description ?? '')}</span>
                <div className="flex gap-1 mt-1">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
                    {String(card.tag ?? '')}
                  </span>
                </div>
              </div>
            )}
          />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            自定义文案 (labels)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            单语言项目无需引入 locale，直接用扁平 labels 覆盖空列占位与新增卡片按钮文案。
          </p>
          <TaskBoard
            columns={labelsColumns}
            onColumnsChange={setLabelsColumns}
            allowAddCard
            labels={{ emptyColumnText: '空空如也', addCardText: '新增卡片' }}
          />
        </section>
      </div>
    </>
  )
}
