import { Progress } from '@expcat/tigercat-react/Progress'

export default function App() {
  return (
    <Progress
      type="circle"
      percentage={72}
      status="success"
      showText
      text="健康"
      aria-label="服务健康度"
    />
  )
}
