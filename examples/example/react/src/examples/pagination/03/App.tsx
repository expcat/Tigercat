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
    </>
  )
}
