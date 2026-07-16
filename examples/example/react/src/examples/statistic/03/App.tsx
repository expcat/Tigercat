import { Statistic } from '@expcat/tigercat-react/Statistic'

export default function App() {
  return (
    <div className="flex flex-wrap gap-8">
      <Statistic title="活跃用户" value={86520} animated groupSeparator />
      <Statistic title="转化率" value={92.4} precision={1} suffix="%" />
      <Statistic title="账户余额" value={4820.5} precision={2} prefix="$" groupSeparator />
    </div>
  )
}
