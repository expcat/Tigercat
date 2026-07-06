import React, { useState } from 'react'
import { DataExport } from '@expcat/tigercat-react/DataExport'
import { Table } from '@expcat/tigercat-react/Table'
import { type TableColumn } from '@expcat/tigercat-react'
import type { DataExportFormat } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './DataExportDemo.tsx?raw'

interface UserRow extends Record<string, unknown> {
  id: number
  name: string
  email: string
  age: number
  status: 'active' | 'disabled'
  joinedAt: string
}

const columns: TableColumn<UserRow>[] = [
  { key: 'name', title: '姓名' },
  { key: 'email', title: '邮箱' },
  { key: 'age', title: '年龄', align: 'right' },
  { key: 'status', title: '状态' },
  { key: 'joinedAt', title: '入职日期' }
]

const rows: UserRow[] = [
  { id: 1, name: '张伟', email: 'zhangwei@example.com', age: 32, status: 'active', joinedAt: '2023-03-15' },
  { id: 2, name: '李娜', email: 'lina@example.com', age: 28, status: 'active', joinedAt: '2024-01-08' },
  { id: 3, name: '王强', email: 'wangqiang@example.com', age: 41, status: 'disabled', joinedAt: '2021-11-02' },
  { id: 4, name: 'Alice Chen', email: 'alice@example.com', age: 35, status: 'active', joinedAt: '2022-07-19' }
]

const statusText: Record<UserRow['status'], string> = {
  active: '在职',
  disabled: '离职'
}

const DataExportDemo: React.FC = () => {
  const [lastExport, setLastExport] = useState<string>('')

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">DataExport 导出</h1>
        <p className="text-gray-600 dark:text-gray-400">
          将表格型数据导出为真正的 .xlsx 工作簿或 Markdown 表格。序列化逻辑按需加载，仅在触发导出时下载。
        </p>
      </div>

      <DemoBlock
        title="组合展示"
        description="基础下拉导出、单一格式按钮、自定义文件名与单元格格式化、导出回调。"
        code={fullPageSnippet}>
        <div className="space-y-8">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              默认提供 Excel 与 Markdown 两种格式，渲染为下拉菜单。列定义与 Table 完全一致。
            </p>
            <div className="flex items-center gap-3">
              <DataExport<UserRow> columns={columns} dataSource={rows} />
            </div>
            <Table<UserRow> columns={columns} dataSource={rows} pagination={false} />
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">单一格式</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              formats 只包含一个格式时渲染为普通按钮。
            </p>
            <div className="flex items-center gap-3">
              <DataExport<UserRow> columns={columns} dataSource={rows} formats={['xlsx']} />
              <DataExport<UserRow> columns={columns} dataSource={rows} formats={['markdown']} />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              自定义文件名与单元格格式化
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              fileName / sheetName 自定义产物命名；cellFormatter 在导出前转换单元格取值（如状态枚举转文案）。
            </p>
            <DataExport<UserRow>
              columns={columns}
              dataSource={rows}
              fileName="员工名单"
              sheetName="在职员工"
              cellFormatter={(value, column) =>
                column.key === 'status' ? statusText[value as UserRow['status']] : value
              }
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">导出回调</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              onExport 在下载触发后回调格式；onError 捕获序列化异常。
            </p>
            <div className="flex items-center gap-3">
              <DataExport<UserRow>
                columns={columns}
                dataSource={rows}
                onExport={(format: DataExportFormat) => setLastExport(format)}
                onError={() => setLastExport('error')}
              />
              {lastExport && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  最近导出：{lastExport}
                </span>
              )}
            </div>
          </section>
        </div>
      </DemoBlock>
    </div>
  )
}

export default DataExportDemo
