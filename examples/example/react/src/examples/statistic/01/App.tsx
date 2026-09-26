import { Statistic } from '@expcat/tigercat-react/Statistic'

export default function App() {
  return (
    <Statistic
      title="本月收入"
      value={89320.5}
      precision={2}
      prefix="¥"
      suffix=" CNY"
      size="lg"
      groupSeparator
    />
  )
}
