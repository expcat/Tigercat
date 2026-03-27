import { useMemo } from 'react'
import { VirtualTable } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicColumns = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '姓名', width: 150 },
  { key: 'email', title: '邮箱' },
  { key: 'status', title: '状态', width: 100 }
]

const basicSnippet = `const columns = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '姓名', width: 150 },
  { key: 'email', title: '邮箱' },
  { key: 'status', title: '状态', width: 100 }
]
const data = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1, name: \`用户 \${i + 1}\`, email: \`user\${i + 1}@example.com\`
}))

<VirtualTable data={data} columns={columns} height={400} rowHeight={48} />`

const styledSnippet = `<VirtualTable data={data} columns={columns} height={300} striped bordered />`

const stateSnippet = `<VirtualTable data={[]} columns={columns} height={200} loading />
<VirtualTable data={[]} columns={columns} height={200} emptyText="暂无数据" />`

const VirtualTableDemo: React.FC = () => {
  const basicData = useMemo(
    () =>
      Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `用户 ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: i % 3 === 0 ? '活跃' : i % 3 === 1 ? '离线' : '忙碌'
      })),
    []
  )

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">VirtualTable 虚拟表格</h1>
      <p className="text-gray-500 mb-8">虚拟滚动表格，可高效渲染大量数据行。</p>

      <DemoBlock title="基础用法" description="1000 行数据，rowHeight=48" code={basicSnippet}>
        <VirtualTable data={basicData} columns={basicColumns} height={400} rowHeight={48} />
      </DemoBlock>

      <DemoBlock title="斑马纹 & 边框" description="striped + bordered" code={styledSnippet}>
        <VirtualTable data={basicData} columns={basicColumns} height={300} striped bordered />
      </DemoBlock>

      <DemoBlock title="加载 & 空状态" description="loading 和 emptyText" code={stateSnippet}>
        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-2">Loading</p>
            <VirtualTable data={[]} columns={basicColumns} height={200} loading />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-2">Empty</p>
            <VirtualTable data={[]} columns={basicColumns} height={200} emptyText="暂无数据" />
          </div>
        </div>
      </DemoBlock>
    </div>
  )
}

export default VirtualTableDemo
