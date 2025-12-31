import React from 'react'
import { Timeline, Card, Space, Divider, Tag } from '@tigercat/react'

const TimelineDemo: React.FC = () => {
  // Basic timeline data
  const basicEvents = [
    { key: 1, label: '2024-01-01', content: '创建项目' },
    { key: 2, label: '2024-01-05', content: '编写文档' },
    { key: 3, label: '2024-01-10', content: '发布版本 1.0' },
  ]

  // Timeline with colors
  const coloredEvents = [
    { 
      key: 1, 
      label: '2024-01-01', 
      content: '项目启动',
      color: '#10b981' 
    },
    { 
      key: 2, 
      label: '2024-01-05', 
      content: '开发进行中',
      color: '#3b82f6' 
    },
    { 
      key: 3, 
      label: '2024-01-10', 
      content: '即将发布',
      color: '#f59e0b' 
    },
  ]

  // Project timeline with custom rendering
  const projectTimeline = [
    {
      key: 1,
      date: '2024-01-01 09:00',
      title: '项目启动会议',
      description: '团队会议和项目计划',
      status: 'completed',
      color: '#10b981',
    },
    {
      key: 2,
      date: '2024-01-05 14:30',
      title: '设计评审',
      description: 'UI/UX 设计展示和反馈',
      status: 'completed',
      color: '#10b981',
    },
    {
      key: 3,
      date: '2024-01-10 10:00',
      title: '开发冲刺 1',
      description: '实现核心功能',
      status: 'in-progress',
      color: '#3b82f6',
    },
    {
      key: 4,
      date: '2024-01-20',
      title: '测试阶段',
      description: 'QA 测试和 Bug 修复',
      status: 'pending',
      color: '#6b7280',
    },
  ]

  // Timeline with custom dots
  const customDotEvents = [
    { 
      key: 1, 
      label: '2024-01-01', 
      content: '项目完成',
      dot: (
        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )
    },
    { 
      key: 2, 
      label: '2024-01-05', 
      content: '进行中',
      dot: <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
    },
    { 
      key: 3, 
      label: '2024-01-10', 
      content: '待处理',
      dot: <div className="w-4 h-4 bg-gray-300 rounded-full" />
    },
  ]

  const getStatusVariant = (status: string): 'success' | 'primary' | 'info' => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'in-progress':
        return 'primary'
      default:
        return 'info'
    }
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Timeline 时间线组件</h1>

      {/* Basic Timeline */}
      <Card header={<h2 className="text-xl font-semibold">基本用法</h2>}>
        <Timeline items={basicEvents} />
      </Card>

      {/* Different Modes */}
      <Card header={<h2 className="text-xl font-semibold">不同的展示模式</h2>}>
        <Space direction="vertical" size={24}>
          <div>
            <h3 className="text-lg font-medium mb-4">左侧时间线 (默认)</h3>
            <Timeline items={basicEvents} mode="left" />
          </div>
          
          <Divider />
          
          <div>
            <h3 className="text-lg font-medium mb-4">右侧时间线</h3>
            <Timeline items={basicEvents} mode="right" />
          </div>
          
          <Divider />
          
          <div>
            <h3 className="text-lg font-medium mb-4">交替展示</h3>
            <Timeline items={basicEvents} mode="alternate" />
          </div>
        </Space>
      </Card>

      {/* Custom Colors */}
      <Card header={<h2 className="text-xl font-semibold">自定义颜色</h2>}>
        <Timeline items={coloredEvents} />
      </Card>

      {/* Custom Dots */}
      <Card header={<h2 className="text-xl font-semibold">自定义节点</h2>}>
        <Timeline items={customDotEvents} />
      </Card>

      {/* Custom Content */}
      <Card header={<h2 className="text-xl font-semibold">自定义内容</h2>}>
        <Timeline 
          items={projectTimeline}
          renderItem={(item: any) => (
            <div>
              <div className="mb-2">
                <span className="text-sm text-gray-500">{item.date}</span>
              </div>
              <div className="font-medium text-gray-900 mb-1">
                {item.title}
                <Tag 
                  variant={getStatusVariant(item.status)}
                  size="sm"
                  className="ml-2"
                >
                  {item.status}
                </Tag>
              </div>
              <div className="text-gray-600">
                {item.description}
              </div>
            </div>
          )}
        />
      </Card>

      {/* Pending State */}
      <Card header={<h2 className="text-xl font-semibold">等待中状态</h2>}>
        <Timeline items={basicEvents} pending />
      </Card>

      {/* Pending with Custom Content */}
      <Card header={<h2 className="text-xl font-semibold">自定义等待内容</h2>}>
        <Timeline 
          items={basicEvents} 
          pending
          pendingContent={
            <div className="flex items-center gap-2 text-blue-600">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>正在处理...</span>
            </div>
          }
        />
      </Card>

      {/* Reverse Order */}
      <Card header={<h2 className="text-xl font-semibold">反转顺序</h2>}>
        <Timeline items={basicEvents} reverse />
      </Card>

      {/* Complex Example */}
      <Card header={<h2 className="text-xl font-semibold">完整示例</h2>}>
        <div className="max-w-2xl">
          <h3 className="text-lg font-medium mb-4">项目时间线</h3>
          <Timeline 
            items={projectTimeline}
            mode="left"
            renderItem={(item: any) => (
              <div>
                <div className="mb-2">
                  <span className="text-sm text-gray-500">{item.date}</span>
                </div>
                <div className="font-medium text-gray-900 mb-1">
                  {item.title}
                  <Tag 
                    variant={getStatusVariant(item.status)}
                    size="sm"
                    className="ml-2"
                  >
                    {item.status}
                  </Tag>
                </div>
                <div className="text-gray-600">
                  {item.description}
                </div>
              </div>
            )}
          />
        </div>
      </Card>
    </div>
  )
}

export default TimelineDemo
