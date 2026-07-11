import { GaugeChart } from '@expcat/tigercat-react/GaugeChart'

const segments = [
  { range: [0, 40] as [number, number], color: '#ef4444' },
  { range: [40, 70] as [number, number], color: '#f59e0b' },
  { range: [70, 100] as [number, number], color: '#10b981' }
]

export default function App() {
  return (
    <>
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">value、min、max</p>
          <div className="flex gap-8 items-end">
            <GaugeChart value={72} label="完成率" />
            <GaugeChart value={35} max={50} label="得分" />
          </div>
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">颜色分段</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">segments 按区间着色</p>
          <GaugeChart
            value={82}
            width={320}
            height={220}
            label="健康指数"
            segments={segments}
            valueFormatter={(v) => v + '%'}
          />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义弧形</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">arcWidth、startAngle、endAngle</p>
          <GaugeChart
            value={60}
            width={280}
            height={200}
            arcWidth={30}
            startAngle={180}
            endAngle={360}
            showTicks={false}
            color="#10b981"
          />
        </section>
      </div>
    </>
  )
}
