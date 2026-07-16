import { HeatmapChart } from '@expcat/tigercat-react/HeatmapChart'

const xLabels = Array.from({ length: 24 }, (_, index) => `${index}时`)
const yLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const data = yLabels.flatMap((y, yIndex) =>
  xLabels.map((x, xIndex) => ({
    x,
    y,
    value: ((xIndex * 7 + yIndex * 13) % 40) + (xIndex % 5) * 12
  }))
)

export default function App() {
  return (
    <div>
      <p className="mb-1 text-sm text-gray-500">
        renderMode=&quot;canvas&quot;：{data.length} 个单元格的大矩阵
      </p>
      <HeatmapChart
        data={data}
        xLabels={xLabels}
        yLabels={yLabels}
        width={620}
        height={220}
        renderMode="canvas"
        cellGap={1}
        cellRadius={1}
        minColor="#ecfdf5"
        maxColor="#047857"
        showTooltip
      />
    </div>
  )
}
