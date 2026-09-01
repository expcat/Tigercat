'use client'

import { BarChart } from '@expcat/tigercat-react/BarChart'
import { Button } from '@expcat/tigercat-react/Button'
import { DatePicker } from '@expcat/tigercat-react/DatePicker'

const selectedDate = '2024-01-15'
const chartData = [
  { x: 'React SSR', y: 22 },
  { x: 'Hydration', y: 28 },
  { x: 'Next', y: 19 }
]

export function TigercatClientSurface() {
  return (
    <>
      <section className="ssr-panel">
        <div className="toolbar">
          <Button variant="primary">保存</Button>
          <DatePicker value={selectedDate} format="yyyy-MM-dd" onChange={() => undefined} />
        </div>
      </section>

      <section className="ssr-panel">
        <BarChart
          data={chartData}
          width={420}
          height={240}
          title="Next SSR chart"
          desc="Bar chart rendered through Next.js SSR"
          gradient
        />
      </section>
    </>
  )
}
