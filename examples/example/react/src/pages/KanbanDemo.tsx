import { useState } from 'react'
import { Kanban } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const defaultColumns = [
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
    cards: [
      { id: '3', title: '开发 Kanban', description: '实现看板组件' }
    ]
  },
  {
    id: 'done',
    title: '已完成',
    cards: [
      { id: '4', title: '项目搭建', description: '初始化项目结构' }
    ]
  }
]

const wipColumns = [
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

const basicSnippet = `const [columns, setColumns] = useState([
  { id: 'todo', title: '待办', cards: [...] },
  { id: 'doing', title: '进行中', cards: [...] },
  { id: 'done', title: '已完成', cards: [...] }
])

<Kanban columns={columns} onColumnsChange={setColumns} allowAddCard />`

const wipSnippet = `<Kanban defaultColumns={columns} draggable={false} enforceWipLimit showCardCount />`

const KanbanDemo: React.FC = () => {
  const [columns, setColumns] = useState(defaultColumns)

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Kanban 看板</h1>
      <p className="text-gray-500 mb-8">可拖拽的看板面板，支持卡片和列拖拽排序。</p>

      <DemoBlock title="基础用法" description="columns 定义列和卡片" code={basicSnippet}>
        <Kanban columns={columns} onColumnsChange={setColumns} allowAddCard style={{ height: 400 }} />
      </DemoBlock>

      <DemoBlock title="禁用拖拽 & WIP 限制" code={wipSnippet}>
        <Kanban defaultColumns={wipColumns} draggable={false} enforceWipLimit showCardCount style={{ height: 350 }} />
      </DemoBlock>
    </div>
  )
}

export default KanbanDemo
