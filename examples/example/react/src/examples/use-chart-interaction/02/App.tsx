import { useState, type MouseEvent } from 'react'
import { createBandScale, createLinearScale } from '@expcat/tigercat-core'
import { ChartAxis } from '@expcat/tigercat-react/ChartAxis'
import { ChartCanvas } from '@expcat/tigercat-react/ChartCanvas'
import { ChartGrid } from '@expcat/tigercat-react/ChartGrid'
import { ChartLegend } from '@expcat/tigercat-react/ChartLegend'
import { ChartSeries } from '@expcat/tigercat-react/ChartSeries'
import { ChartTooltip } from '@expcat/tigercat-react/ChartTooltip'

interface OrderDatum {
  x: string
  y: number
}

const data: OrderDatum[] = [
  { x: 'Q1', y: 42 },
  { x: 'Q2', y: 68 },
  { x: 'Q3', y: 54 },
  { x: 'Q4', y: 86 }
]

const innerWidth = 290
const innerHeight = 180
const xScale = createBandScale(
  data.map((item) => item.x),
  [0, innerWidth],
  { paddingInner: 0.3, paddingOuter: 0.1 }
)
const yScale = createLinearScale([0, 100], [innerHeight, 0])

export default function ChartPrimitivesExample() {
  const [active, setActive] = useState(true)
  const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null)

  const showTooltip = (item: OrderDatum, event: MouseEvent<SVGRectElement>) => {
    setTooltip({
      content: `${item.x}：${item.y} 单`,
      x: event.clientX,
      y: event.clientY
    })
  }

  return (
    <div style={{ display: 'grid', gap: 12, width: 'min(100%, 360px)' }}>
      <ChartCanvas
        width={360}
        height={240}
        padding={{ top: 20, right: 20, bottom: 40, left: 50 }}
        title="季度订单量"
        desc="使用 Tigercat 图表底层组件绘制的交互式柱状图"
        style={{ maxWidth: '100%', height: 'auto' }}>
        <ChartGrid
          xScale={xScale}
          yScale={yScale}
          yTickValues={[0, 25, 50, 75, 100]}
          lineStyle="dashed"
        />
        <ChartAxis scale={xScale} orientation="bottom" y={innerHeight} label="季度" />
        <ChartAxis
          scale={yScale}
          orientation="left"
          tickValues={[0, 25, 50, 75, 100]}
          label="订单"
        />
        <ChartSeries
          data={data}
          name="orders"
          color="#2563eb"
          type="custom"
          opacity={active ? 1 : 0.25}>
          {({ data: seriesData, color }) =>
            seriesData.map((item) => {
              const y = yScale.map(item.y)
              return (
                <rect
                  key={item.x}
                  x={xScale.map(item.x)}
                  y={y}
                  width={xScale.bandwidth ?? 0}
                  height={innerHeight - y}
                  rx={4}
                  fill={color}
                  role="img"
                  aria-label={`${item.x} 订单量 ${item.y}`}
                  onMouseEnter={(event) => showTooltip(item, event)}
                  onMouseMove={(event) => showTooltip(item, event)}
                  onMouseLeave={() => setTooltip(null)}
                />
              )
            })
          }
        </ChartSeries>
      </ChartCanvas>

      <ChartLegend
        items={[{ index: 0, label: '订单量', color: '#2563eb', active }]}
        interactive
        ariaLabel="切换图表序列"
        onItemClick={() => setActive((value) => !value)}
      />
      <ChartTooltip
        content={tooltip?.content ?? ''}
        open={Boolean(tooltip)}
        x={tooltip?.x ?? 0}
        y={tooltip?.y ?? 0}
      />
    </div>
  )
}
