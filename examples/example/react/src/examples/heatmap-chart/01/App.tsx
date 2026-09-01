import { HeatmapChart } from '@expcat/tigercat-react/HeatmapChart'

const days = ['周一', '周二', '周三', '周四', '周五']
const periods = ['上午', '下午', '晚上']
const values = [18, 42, 65, 31, 78, 54, 27, 88, 46, 63, 35, 71, 58, 24, 92]
const data = periods.flatMap((period, row) =>
  days.map((day, col) => ({
    x: day,
    y: period,
    value: values[row * days.length + col] ?? 0
  }))
)

export default function App() {
  return <HeatmapChart data={data} xLabels={days} yLabels={periods} />
}
