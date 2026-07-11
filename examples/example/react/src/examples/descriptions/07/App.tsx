import { Button } from '@expcat/tigercat-react/Button'
import { Descriptions } from '@expcat/tigercat-react/Descriptions'

const twoColumnResponsive = { xs: 1, sm: 1, md: 2 }

const threeColumnResponsive = { xs: 1, sm: 1, md: 2, lg: 3 }

const fourColumnResponsive = { xs: 1, sm: 2, lg: 4 }

export default function App() {
  // Basic user information
  const userInfo = [
    { label: '姓名', content: '张三' },
    { label: '电话', content: '1234567890' },
    { label: '邮箱', content: 'zhangsan@example.com' },
    { label: '地址', content: '北京市朝阳区某街道' },
    { label: '公司', content: '某科技有限公司' },
    { label: '职位', content: '高级前端工程师' }
  ]

  // Product details with spanning
  const productDetails = [
    { label: '产品名称', content: '云数据库' },
    { label: '计费方式', content: '包年包月' },
    { label: '创建时间', content: '2024-01-01 10:00:00' },
    { label: '到期时间', content: '2025-01-01 10:00:00' },
    {
      label: '描述',
      content: '这是一个高性能的云数据库服务，支持多种数据库引擎，提供自动备份、监控和扩展功能。',
      span: 2
    }
  ]

  // Order information
  const orderInfo = [
    { label: '订单编号', content: 'ORDER-2024-001' },
    { label: '订单状态', content: '已完成' },
    { label: '下单时间', content: '2024-01-15 14:30:00' },
    { label: '支付时间', content: '2024-01-15 14:35:00' },
    { label: '收货地址', content: '上海市浦东新区张江高科技园区', span: 2 },
    { label: '订单总额', content: '¥1,299.00' },
    { label: '优惠金额', content: '¥100.00' },
    { label: '实付金额', content: '¥1,199.00' }
  ]

  // Server configuration
  const serverConfig = [
    { label: 'CPU', content: '8 核' },
    { label: '内存', content: '16 GB' },
    { label: '磁盘', content: '500 GB SSD' },
    { label: '带宽', content: '10 Mbps' },
    { label: '操作系统', content: 'Ubuntu 20.04 LTS' },
    { label: 'IP 地址', content: '192.168.1.100' }
  ]

  // Items with per-item custom classes
  const highlightItems = [
    {
      label: '状态',
      content: '运行中',
      labelClassName: 'text-blue-600',
      contentClassName: 'text-green-600 font-semibold'
    },
    { label: '告警', content: '2 条未处理', contentClassName: 'text-amber-600' },
    { label: '错误', content: '无', contentClassName: 'text-gray-400' },
    { label: 'CPU 使用率', content: '68%' }
  ]

  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <Descriptions
          title="订单详情"
          bordered
          column={threeColumnResponsive}
          items={orderInfo}
          extra={<Button size="sm">编辑</Button>}
        />
      </div>
    </>
  )
}
