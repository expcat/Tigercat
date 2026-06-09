import { useMemo } from 'react'
import { VirtualTable, type TableColumn } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicColumns: TableColumn[] = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '姓名', width: 150 },
  { key: 'email', title: '邮箱' },
  { key: 'status', title: '状态', width: 100 }
]

const fixedColumns: TableColumn[] = [
  {
    key: 'id',
    title: 'ID',
    width: 96,
    fixed: 'left',
    fixedHeaderClassName:
      'shadow-[inset_-1px_0_0_var(--tiger-border,#e5e7eb)] text-[var(--tiger-text,#111827)]',
    fixedClassName: ({ selected }) =>
      selected
        ? 'shadow-[inset_-1px_0_0_var(--tiger-border,#e5e7eb)] ring-2 ring-inset ring-sky-200/70'
        : 'shadow-[inset_-1px_0_0_var(--tiger-border,#e5e7eb)]'
  },
  { key: 'name', title: '姓名', width: 180 },
  { key: 'email', title: '邮箱', width: 240 },
  {
    key: 'status',
    title: '状态',
    width: 120,
    fixed: 'right',
    fixedHeaderClassName:
      'shadow-[inset_1px_0_0_var(--tiger-border,#e5e7eb)] text-[var(--tiger-text,#111827)]',
    fixedClassName: ({ selected }) =>
      selected
        ? 'shadow-[inset_1px_0_0_var(--tiger-border,#e5e7eb)] ring-2 ring-inset ring-sky-200/70'
        : 'shadow-[inset_1px_0_0_var(--tiger-border,#e5e7eb)]'
  }
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

const fixedSnippet = `<VirtualTable
  data={data}
  columns={fixedColumns}
  height={280}
  rowHeight={48}
  striped
  selectedKeys={[2, 4]}
/>`

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
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-2">VirtualTable 虚拟表格</h1>
      <p className="text-gray-500 mb-8">虚拟滚动表格，可高效渲染大量数据行。</p>

      <DemoBlock title="基础用法" description="1000 行数据，rowHeight=48" code={basicSnippet}>
        <VirtualTable data={basicData} columns={basicColumns} height={400} rowHeight={48} />
      </DemoBlock>

      <DemoBlock title="斑马纹 & 边框" description="striped + bordered" code={styledSnippet}>
        <VirtualTable data={basicData} columns={basicColumns} height={300} striped bordered />
      </DemoBlock>

      <DemoBlock
        title="固定列样式自定义"
        description="固定列支持 fixedClassName / fixedHeaderClassName，可根据 selected 状态自定义 sticky 单元格外观。"
        code={fixedSnippet}>
        <VirtualTable
          data={basicData.slice(0, 24)}
          columns={fixedColumns}
          height={280}
          rowHeight={48}
          striped
          selectedKeys={[2, 4]}
        />
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
