import { FloatButton } from '@expcat/tigercat-react/FloatButton'
import { FloatButtonGroup } from '@expcat/tigercat-react/FloatButtonGroup'

export default function App() {
  return (
    <div className="relative h-56 rounded border">
      <FloatButtonGroup trigger="hover" placement="top-left">
        <FloatButton type="default" ariaLabel="编辑" />
        <FloatButton type="default" ariaLabel="分享" />
      </FloatButtonGroup>
    </div>
  )
}
