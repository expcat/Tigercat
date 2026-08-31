import { Switch } from '@expcat/tigercat-react/Switch'

export default function App() {
  return (
    <div className="flex items-center gap-6">
      <Switch checked disabled>
        开 · disabled
      </Switch>
      <Switch checked={false} disabled>
        关 · disabled
      </Switch>
    </div>
  )
}
