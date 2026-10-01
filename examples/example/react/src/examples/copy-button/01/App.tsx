import { CopyButton } from '@expcat/tigercat-react/CopyButton'

export default function App() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <CopyButton text="tigercat" />
      <CopyButton text="tigercat" label="复制令牌" />
    </div>
  )
}
