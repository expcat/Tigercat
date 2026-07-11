import { FloatButton } from '@expcat/tigercat-react/FloatButton'

export default function App() {
  return (
    <FloatButton
      floating
      placement="bottom-right"
      offset={{ x: 32, y: 32 }}
      size="lg"
      shape="square"
      tooltip="新建"
      ariaLabel="新建内容"
    />
  )
}
