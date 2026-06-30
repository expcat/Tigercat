import { useState } from 'react'
import { Kanban } from '@expcat/tigercat-react/Kanban'
import type { TaskBoardColumn } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './KanbanDemo.tsx?raw'

const defaultColumns: TaskBoardColumn[] = [
  {
    id: 'todo',
    title: '待办',
    cards: [
      { id: '1', title: '设计 UI', description: '完成组件设计稿' },
      { id: '2', title: '编写文档', description: '更新 API 文档' }
    ]
  },
  {
    id: 'doing',
    title: '进行中',
    cards: [{ id: '3', title: '开发 Kanban', description: '实现看板组件' }]
  },
  {
    id: 'done',
    title: '已完成',
    cards: [{ id: '4', title: '项目搭建', description: '初始化项目结构' }]
  }
]

const wipColumns: TaskBoardColumn[] = [
  {
    id: 'backlog',
    title: '需求池',
    wipLimit: 5,
    cards: [
      { id: 'a', title: '需求 A' },
      { id: 'b', title: '需求 B' },
      { id: 'c', title: '需求 C' }
    ]
  },
  {
    id: 'wip',
    title: '开发中 (WIP=2)',
    wipLimit: 2,
    cards: [
      { id: 'd', title: '任务 D' },
      { id: 'e', title: '任务 E' }
    ]
  },
  { id: 'review', title: '评审', cards: [] }
]

const KanbanDemo: React.FC = () => {
  const [columns, setColumns] = useState(defaultColumns)

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-2">Kanban 看板</h1>
      <p className="text-gray-500 mb-8">可拖拽的看板面板，支持卡片和列拖拽排序。</p>

      <DemoBlock
        title="组合展示"
        description="合并展示基础用法、禁用拖拽 & WIP 限制，减少重复示例块。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">columns 定义列和卡片</p>
            <Kanban
              columns={columns}
              onColumnsChange={setColumns}
              allowAddCard
              style={{ height: 400 }}
            />
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              禁用拖拽 & WIP 限制
            </h3>
            <Kanban
              defaultColumns={wipColumns}
              draggable={false}
              enforceWipLimit
              showCardCount
              style={{ height: 350 }}
            />
          </section>
        </div>
      </DemoBlock>
    </div>
  )
}

export default KanbanDemo
