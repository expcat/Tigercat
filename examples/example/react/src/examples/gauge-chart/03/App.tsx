import { GaugeChart } from '@expcat/tigercat-react/GaugeChart'

export default function App() {
  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <p className="mb-1 text-sm text-gray-500">默认 135°–405° 完整表盘 + gradient</p>
        <GaugeChart value={72} label="CPU" width={280} height={220} arcWidth={22} gradient />
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-500">showTooltip + tooltipFormatter</p>
        <GaugeChart
          value={38}
          label="内存"
          width={280}
          height={220}
          showTooltip
          tooltipFormatter={(value) => `当前占用 ${value}%`}
        />
      </div>
    </div>
  )
}
