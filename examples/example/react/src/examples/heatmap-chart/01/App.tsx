import { useMemo } from 'react'
import { HeatmapChart } from '@expcat/tigercat-react/HeatmapChart'

const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const hours = ['上午', '下午', '晚上']

export default function App() {
  const heatData = useMemo(
    () =>
      days.flatMap((day) =>
        hours.map((hour) => ({
          x: day,
          y: hour,
          value: Math.round(Math.random() * 100)
        }))
      ),
    []
  )

  return (
    <>
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">xLabels / yLabels 定义坐标轴</p>
          <HeatmapChart
            data={heatData}
            xLabels={days}
            yLabels={hours}
            width={500}
            height={280}
            hoverable
          />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            显示数值 & 自定义颜色
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">showValues、minColor、maxColor</p>
          <HeatmapChart
            data={heatData}
            xLabels={days}
            yLabels={hours}
            width={500}
            height={280}
            showValues
            minColor="#fef3c7"
            maxColor="#dc2626"
            cellRadius={4}
          />
        </section>
      </div>
    </>
  )
}
