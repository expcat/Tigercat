import { createBandScale, createLinearScale } from '@expcat/tigercat-core'
import { ChartAxis } from '@expcat/tigercat-react/ChartAxis'
import { ChartCanvas } from '@expcat/tigercat-react/ChartCanvas'
import { ChartGrid } from '@expcat/tigercat-react/ChartGrid'
import { ChartLegend } from '@expcat/tigercat-react/ChartLegend'
import { ChartSeries } from '@expcat/tigercat-react/ChartSeries'
import { ChartTooltip } from '@expcat/tigercat-react/ChartTooltip'
import { useChartInteraction } from '@expcat/tigercat-react'

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

export default function ChartPrimitivesExample() {
  const interaction = useChartInteraction<OrderDatum>({
    hoverable: true,
    selectable: true,
    showTooltip: true,
    activeOpacity: 1,
    inactiveOpacity: 0.35,
    getData: (index) => data[index]
  })

  return (
    <div className={interaction.wrapperClasses} style={{ width: 'min(100%, 360px)' }}>
      <ChartCanvas
        width={360}
        height={240}
        title="季度订单量"
        desc="组合原语 + useChartInteraction">
        {({ innerRect }) => {
          const xScale = createBandScale(
            data.map((item) => item.x),
            [0, innerRect.width],
            { paddingInner: 0.3, paddingOuter: 0.1 }
          )
          const yScale = createLinearScale([0, 100], [innerRect.height, 0])
          return (
            <>
              <ChartGrid
                xScale={xScale}
                yScale={yScale}
                yTickValues={[0, 25, 50, 75, 100]}
                lineStyle="dashed"
              />
              <ChartAxis scale={xScale} orientation="bottom" y={innerRect.height} label="季度" />
              <ChartAxis
                scale={yScale}
                orientation="left"
                tickValues={[0, 25, 50, 75, 100]}
                label="订单"
              />
              <ChartSeries data={data} name="orders" color="#2563eb" type="bar">
                {({ color }) =>
                  data.map((item, index) => {
                    const y = yScale.map(item.y)
                    return (
                      <rect
                        key={item.x}
                        x={xScale.map(item.x)}
                        y={y}
                        width={xScale.bandwidth ?? 0}
                        height={innerRect.height - y}
                        rx={4}
                        fill={color}
                        opacity={interaction.getElementOpacity(index)}
                        role="button"
                        tabIndex={interaction.resolvedSelectedIndex === index ? 0 : -1}
                        aria-label={`${item.x} 订单量 ${item.y}`}
                        onMouseEnter={(event) => interaction.handleMouseEnter(index, event)}
                        onMouseMove={interaction.handleMouseMove}
                        onMouseLeave={interaction.handleMouseLeave}
                        onClick={() => interaction.handleClick(index)}
                        onKeyDown={(event) => interaction.handleKeyDown(event, index)}
                      />
                    )
                  })
                }
              </ChartSeries>
            </>
          )
        }}
      </ChartCanvas>
      <ChartLegend
        items={[
          {
            index: 0,
            label: '订单量',
            color: '#2563eb',
            selected: interaction.resolvedSelectedIndex === 0
          }
        ]}
        interactive
        onItemClick={interaction.handleLegendClick}
        onItemHover={interaction.handleLegendHover}
        onItemLeave={interaction.handleLegendLeave}
      />
      <ChartTooltip
        content={
          interaction.resolvedHoveredIndex == null
            ? ''
            : `${data[interaction.resolvedHoveredIndex]?.x}：${data[interaction.resolvedHoveredIndex]?.y} 单`
        }
        open={interaction.resolvedHoveredIndex != null}
        x={interaction.tooltipPosition.x}
        y={interaction.tooltipPosition.y}
      />
    </div>
  )
}
