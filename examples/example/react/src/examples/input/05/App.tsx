import { Input } from '@expcat/tigercat-react/Input'

export default function App() {
  return (
    <div className="w-full max-w-md space-y-3">
      <Input defaultValue="禁用" disabled />
      <Input defaultValue="只读" readOnly />
    </div>
  )
}
