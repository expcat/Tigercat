import { PrintLayout } from '@expcat/tigercat-react/PrintLayout'
import { PrintPageBreak } from '@expcat/tigercat-react/PrintPageBreak'

export default function App() {
  return (
    <PrintLayout
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
  )
}
