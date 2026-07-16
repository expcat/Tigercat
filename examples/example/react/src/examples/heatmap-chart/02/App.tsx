import { HeatmapChart } from '@expcat/tigercat-react/HeatmapChart'

const days = ['周一', '周二', '周三', '周四', '周五']
const periods = ['上午', '下午', '晚上']
const values = [18, 42, 65, 31, 78, 54, 27, 88, 46, 63, 35, 71, 58, 24, 92]
const data = days.flatMap((day, dayIndex) =>
  periods.map((period, periodIndex) => ({
    x: day,
    y: period,
    value: values[dayIndex * periods.length + periodIndex] ?? 0
  }))
)

export default function App() {
  return (
    <div>
      <p className="mb-1 text-sm text-gray-500">
        valueFormatter + cellGap/cellRadius + colorSpace=&quot;oklch&quot;
      </p>
      <HeatmapChart
        data={data}
        xLabels={days}
        yLabels={periods}
        width={500}
        height={260}
        showValues
        valueFormatter={(value) => `${value}%`}
        cellGap={4}
        cellRadius={6}
        colorSpace="oklch"
        minColor="#e0f2fe"
        maxColor="#1d4ed8"
        showTooltip
      />
    </div>
  )
}
