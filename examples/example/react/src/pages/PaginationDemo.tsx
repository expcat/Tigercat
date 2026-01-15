import React, { useState } from 'react'
import { Pagination } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

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

  const basicSnippet = `<Pagination current={current1} onChange={setCurrent1} total={100} pageSize={10} />`

  const quickSnippet = `<Pagination
    current={current2}
    onChange={setCurrent2}
    total={500}
    pageSize={10}
    showQuickJumper
  />`

  const sizeChangeSnippet = `<Pagination
    current={current3}
    onChange={setCurrent3}
    pageSize={pageSize}
    total={500}
    pageSizeOptions={[10, 20, 50, 100]}
    showSizeChanger
    onPageSizeChange={handlePageSizeChange}
  />`

  const simpleSnippet = `<Pagination current={current4} onChange={setCurrent4} total={500} simple />`

  const sizeSnippet = `<div className="space-y-4">
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
  </div>`

  const alignSnippet = `<div className="space-y-4">
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
  </div>`

  const totalTextSnippet = `<Pagination
    current={current7}
    onChange={setCurrent7}
    total={100}
    totalText={customTotalText}
  />`

  const disabledSnippet = `<Pagination current={current8} onChange={setCurrent8} total={100} disabled />`

  const fullSnippet = `<Pagination
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
  />`

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pagination 分页</h1>
        <p className="text-gray-600">
          用于在数据量较大时进行分页展示，支持多种模式、快速跳页、页码选择等特性。
        </p>
      </div>

      {/* 基本用法 */}
      <DemoBlock title="基本用法" description="最简单的分页组件。" code={basicSnippet}>
        <Pagination current={current1} onChange={setCurrent1} total={100} pageSize={10} />
      </DemoBlock>

      {/* 快速跳页 */}
      <DemoBlock
        title="快速跳页"
        description="显示快速跳页输入框，方便快速跳转到指定页。"
        code={quickSnippet}>
        <Pagination
          current={current2}
          onChange={setCurrent2}
          total={500}
          pageSize={10}
          showQuickJumper
        />
      </DemoBlock>

      {/* 改变每页条数 */}
      <DemoBlock
        title="改变每页条数"
        description="可以改变每页显示的条数。"
        code={sizeChangeSnippet}>
        <Pagination
          current={current3}
          onChange={setCurrent3}
          pageSize={pageSize}
          total={500}
          pageSizeOptions={[10, 20, 50, 100]}
          showSizeChanger
          onPageSizeChange={handlePageSizeChange}
        />
      </DemoBlock>

      {/* 简单模式 */}
      <DemoBlock
        title="简单模式"
        description="只显示上一页、下一页和当前页/总页数。"
        code={simpleSnippet}>
        <Pagination current={current4} onChange={setCurrent4} total={500} simple />
      </DemoBlock>

      {/* 不同尺寸 */}
      <DemoBlock title="不同尺寸" description="提供三种尺寸：小、中、大。" code={sizeSnippet}>
        <div className="space-y-4">
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
      </DemoBlock>

      {/* 自定义对齐方式 */}
      <DemoBlock
        title="自定义对齐方式"
        description="可以设置分页组件的对齐方式。"
        code={alignSnippet}>
        <div className="space-y-4">
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
      </DemoBlock>

      {/* 自定义总数文本 */}
      <DemoBlock
        title="自定义总数文本"
        description="可以自定义显示总条数的文本。"
        code={totalTextSnippet}>
        <Pagination
          current={current7}
          onChange={setCurrent7}
          total={100}
          totalText={customTotalText}
        />
      </DemoBlock>

      {/* 禁用状态 */}
      <DemoBlock title="禁用状态" description="禁用分页组件的所有交互。" code={disabledSnippet}>
        <Pagination current={current8} onChange={setCurrent8} total={100} disabled />
      </DemoBlock>

      {/* 完整示例 */}
      <DemoBlock
        title="完整示例"
        description="包含所有功能的完整示例（查看控制台）。"
        code={fullSnippet}>
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
      </DemoBlock>
    </div>
  )
}

export default PaginationDemo
