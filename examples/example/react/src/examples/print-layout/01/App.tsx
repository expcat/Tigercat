import { PrintLayout } from '@expcat/tigercat-react/PrintLayout'
import { PrintPageBreak } from '@expcat/tigercat-react/PrintPageBreak'
import { Button } from '@expcat/tigercat-react/Button'
import { useRef } from 'react'
import type { PrintLayoutInstance } from '@expcat/tigercat-react/PrintLayout'

export default function App() {
  const layoutRef = useRef<PrintLayoutInstance>(null)

  return (
    <div className="space-y-3">
      <Button size="sm" onClick={() => layoutRef.current?.print()}>
        打印
      </Button>
      <PrintLayout
        ref={layoutRef}
        pageSize="A4"
        orientation="landscape"
        showHeader
        showFooter
        showPageBreaks
        headerText="季度报告"
        footerText="Tigercat">
        <h2 className="text-xl font-bold">第一页</h2>
        <p>横向 A4 打印内容。</p>
        <PrintPageBreak />
        <h2 className="text-xl font-bold">第二页</h2>
      </PrintLayout>
    </div>
  )
}
