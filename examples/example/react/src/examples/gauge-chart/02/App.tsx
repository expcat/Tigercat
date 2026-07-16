import { GaugeChart } from '@expcat/tigercat-react/GaugeChart'

export default function App() {
  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <p className="mb-1 text-sm text-gray-500">min/max 自定义量程 + tickCount</p>
        <GaugeChart
          value={1280}
          min={0}
          max={2000}
          tickCount={5}
          label="转速 (rpm)"
          width={280}
          height={200}
        />
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-500">showTicks=false + color/trackColor</p>
        <GaugeChart
          value={64}
          showTicks={false}
          color="#7c3aed"
          trackColor="#ede9fe"
          label="完成度"
          width={280}
          height={200}
          valueFormatter={(value) => `${value}%`}
        />
      </div>
    </div>
  )
}
