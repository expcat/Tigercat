import React, { useState, useMemo } from 'react'
import { Pagination } from '@expcat/tigercat-react/Pagination'
import { type TigerLocalePagination } from '@expcat/tigercat-core'

export default function App() {
  const [current1, setCurrent1] = useState(1)

  const [current2, setCurrent2] = useState(1)

  const [current3, setCurrent3] = useState(1)

  const [pageSize, setPageSize] = useState(10)

  const [current4, setCurrent4] = useState(1)

  const [current5, setCurrent5] = useState(1)

  const [current6, setCurrent6] = useState(1)

  const [current7, setCurrent7] = useState(1)

  const [current8, setCurrent8] = useState(1)

  const [current9, setCurrent9] = useState(1)

  const [current10, setCurrent10] = useState(1)

  const [current11, setCurrent11] = useState(1)

  const [currentLabels, setCurrentLabels] = useState(1)

  const [demoLang, setDemoLang] = useState<'en-US' | 'zh-CN'>('zh-CN')

  const handlePageSizeChange = (page: number, size: number) => {
    console.log('页码大小改变 - 当前页:', page, '每页条数:', size)
    setCurrent3(page)
    setPageSize(size)
  }

  const customTotalText = (total: number, range: [number, number]) => {
    return `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
  }

  // i18n custom labels
  const customLabels = useMemo<Partial<TigerLocalePagination>>(() => {
    return demoLang === 'zh-CN'
      ? {
          prevPageAriaLabel: '上一页',
          nextPageAriaLabel: '下一页',
          pageText: '页',
          itemsPerPageText: '条/页',
          jumpToText: '跳至',
          totalText: '共 {total} 条'
        }
      : {
          prevPageAriaLabel: 'Previous',
          nextPageAriaLabel: 'Next',
          pageText: 'Page',
          itemsPerPageText: 'items/page',
          jumpToText: 'Go to',
          totalText: 'Total {total} items'
        }
  }, [demoLang])

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
          <Pagination current={current1} onChange={setCurrent1} total={100} pageSize={10} />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">快速跳页</h3>
          <Pagination
            current={current2}
            onChange={setCurrent2}
            total={500}
            pageSize={10}
            showQuickJumper
          />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">改变每页条数</h3>
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
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">简单模式</h3>
          <Pagination current={current4} onChange={setCurrent4} total={500} simple />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">不同尺寸</h3>
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
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义对齐方式</h3>
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
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义总数文本</h3>
          <Pagination
            current={current7}
            onChange={setCurrent7}
            total={100}
            totalText={customTotalText}
          />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用状态</h3>
          <Pagination current={current8} onChange={setCurrent8} total={100} disabled />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">单页隐藏</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">下方分页组件因为只有 1 页而被隐藏：</p>
            <Pagination
              current={current10}
              onChange={setCurrent10}
              total={5}
              pageSize={10}
              hideOnSinglePage
            />
            <p className="text-sm text-gray-400 italic">
              （如果看不到分页组件，说明 hideOnSinglePage 生效了）
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            紧凑页码 (showLessItems)
          </h3>
          <Pagination current={current11} onChange={setCurrent11} total={500} showLessItems />
        </div>
      </div>
    </>
  )
}
