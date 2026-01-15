import React, { useState } from 'react'
import { Pagination, Divider } from '@expcat/tigercat-react'

const PaginationDemo: React.FC = () => {
  const [current1, setCurrent1] = useState(1)
  const [current2, setCurrent2] = useState(1)
  const [current3, setCurrent3] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [current4, setCurrent4] = useState(1)
  const [current5, setCurrent5] = useState(1)
  const [current6, setCurrent6] = useState(1)
  const [current7, setCurrent7] = useState(1)
  const [current8, setCurrent8] = useState(1)

  const handlePageSizeChange = (page: number, size: number) => {
    console.log('页码大小改变 - 当前页:', page, '每页条数:', size)
    setCurrent3(page)
    setPageSize(size)
  }

  const customTotalText = (total: number, range: [number, number]) => {
    return `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pagination 分页</h1>
        <p className="text-gray-600">
          用于在数据量较大时进行分页展示，支持多种模式、快速跳页、页码选择等特性。
        </p>
      </div>

      {/* 基本用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基本用法</h2>
        <p className="text-gray-600 mb-6">最简单的分页组件。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Pagination current={current1} onChange={setCurrent1} total={100} pageSize={10} />
        </div>
        <Divider className="my-6" />
      </section>

      {/* 快速跳页 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">快速跳页</h2>
        <p className="text-gray-600 mb-6">显示快速跳页输入框，方便快速跳转到指定页。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Pagination
            current={current2}
            onChange={setCurrent2}
            total={500}
            pageSize={10}
            showQuickJumper
          />
        </div>
        <Divider className="my-6" />
      </section>

      {/* 改变每页条数 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">改变每页条数</h2>
        <p className="text-gray-600 mb-6">可以改变每页显示的条数。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Pagination
            current={current3}
            onChange={setCurrent3}
            pageSize={pageSize}
            total={500}
            pageSizeOptions={[10, 20, 50, 100]}
            showSizeChanger
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
        <Divider className="my-6" />
      </section>

      {/* 简单模式 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">简单模式</h2>
        <p className="text-gray-600 mb-6">只显示上一页、下一页和当前页/总页数。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Pagination current={current4} onChange={setCurrent4} total={500} simple />
        </div>
        <Divider className="my-6" />
      </section>

      {/* 不同尺寸 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不同尺寸</h2>
        <p className="text-gray-600 mb-6">提供三种尺寸：小、中、大。</p>
        <div className="p-6 bg-gray-50 rounded-lg space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">小尺寸</p>
            <Pagination current={current5} onChange={setCurrent5} total={100} size="small" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">中等尺寸（默认）</p>
            <Pagination current={current5} onChange={setCurrent5} total={100} size="medium" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">大尺寸</p>
            <Pagination current={current5} onChange={setCurrent5} total={100} size="large" />
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 自定义对齐方式 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">自定义对齐方式</h2>
        <p className="text-gray-600 mb-6">可以设置分页组件的对齐方式。</p>
        <div className="p-6 bg-gray-50 rounded-lg space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">左对齐</p>
            <Pagination current={current6} onChange={setCurrent6} total={100} align="left" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">居中对齐（默认）</p>
            <Pagination current={current6} onChange={setCurrent6} total={100} align="center" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">右对齐</p>
            <Pagination current={current6} onChange={setCurrent6} total={100} align="right" />
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 自定义总数文本 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">自定义总数文本</h2>
        <p className="text-gray-600 mb-6">可以自定义显示总条数的文本。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Pagination
            current={current7}
            onChange={setCurrent7}
            total={100}
            totalText={customTotalText}
          />
        </div>
        <Divider className="my-6" />
      </section>

      {/* 禁用状态 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用状态</h2>
        <p className="text-gray-600 mb-6">禁用分页组件的所有交互。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Pagination current={current8} onChange={setCurrent8} total={100} disabled />
        </div>
        <Divider className="my-6" />
      </section>

      {/* 完整示例 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">完整示例</h2>
        <p className="text-gray-600 mb-6">包含所有功能的完整示例（查看控制台）。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Pagination
            current={current3}
            onChange={setCurrent3}
            pageSize={pageSize}
            total={500}
            pageSizeOptions={[10, 20, 50, 100]}
            showQuickJumper
            showSizeChanger
            totalText={customTotalText}
            size="medium"
            align="center"
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </section>
    </div>
  )
}

export default PaginationDemo
