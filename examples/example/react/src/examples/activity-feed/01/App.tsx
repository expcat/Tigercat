import { ActivityFeed } from '@expcat/tigercat-react/ActivityFeed'
import type { ActivityGroup } from '@expcat/tigercat-core'

const activityGroups: ActivityGroup[] = [
  {
    key: 'today',
    title: '今天',
    items: [
      {
        id: 1,
        title: '更新访问策略',
        description: '安全组策略已更新并生效。',
        time: '09:30',
        user: { name: '管理员', avatar: 'https://i.pravatar.cc/40?img=12' },
        status: { label: '已完成', variant: 'success' },
        actions: [{ label: '查看详情', href: '#' }]
      },
      {
        id: 2,
        title: '导入审计日志',
        description:
          '共导入 24 条记录。这是一条较长的描述，用来测试文本换行和布局在长内容下的表现是否良好，确保没有溢出或错位。',
        time: '10:05',
        user: { name: '系统' },
        status: { label: '处理中', variant: 'warning' },
        actions: [
          { label: '重试', href: '#' },
          { label: '取消', href: '#' }
        ]
      }
    ]
  },
  {
    key: 'yesterday',
    title: '昨天',
    items: [
      {
        id: 3,
        title: '发布版本 2.1',
        description: '包含安全修复与性能优化。',
        time: '16:45',
        user: { name: 'DevOps', avatar: 'https://i.pravatar.cc/40?img=6' },
        status: { label: '成功', variant: 'primary' },
        actions: [{ label: '变更记录', href: '#' }]
      }
    ]
  }
]

export default function App() {
  return (
    <>
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">分组展示</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">按日期分组展示动态。</p>
          <ActivityFeed groups={activityGroups} />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">加载态</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">数据加载中时的展示。</p>
          <ActivityFeed loading loadingText="正在加载动态..." />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">空态</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">无数据时的展示。</p>
          <ActivityFeed items={[]} emptyText="暂无活动" />
        </section>
      </div>
    </>
  )
}
