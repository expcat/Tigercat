import { Divider } from '@expcat/tigercat-react/Divider'

export default function App() {
  return (
    <div>
      <p>上方内容</p>
      <Divider lineStyle="dashed" spacing="lg" color="var(--tiger-primary, #2563eb)" />
      <p>下方内容</p>
      <Divider>或</Divider>
      <p>带文字的分割线</p>
    </div>
  )
}
