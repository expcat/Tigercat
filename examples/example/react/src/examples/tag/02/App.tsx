import { Tag } from '@expcat/tigercat-react/Tag'

export default function App() {
  return (
    <Tag variant="warning" closable onClose={(event) => event.preventDefault()}>
      阻止关闭
    </Tag>
  )
}
