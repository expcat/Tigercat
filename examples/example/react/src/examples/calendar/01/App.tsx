import { useState } from 'react'
import { Calendar } from '@expcat/tigercat-react/Calendar'

const june = new Date(2024, 5, 15)
const august = new Date(2024, 7, 20)

export default function App() {
  const [date, setDate] = useState<Date | null>(june)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm text-[var(--tiger-text-muted)]">不绑 value，点格子会留下选中</p>
        <Calendar defaultValue={june} now={june} />
      </div>
      <div>
        <p className="mb-2 text-sm text-[var(--tiger-text-muted)]">受控：父级把选中改到另一月</p>
        <button
          type="button"
          className="mb-2 rounded border px-2 py-1 text-sm"
          onClick={() => setDate(august)}>
          跳到 8 月
        </button>
        <Calendar value={date ?? undefined} now={june} onChange={setDate} />
        <p className="mt-2 text-sm text-[var(--tiger-text-muted)]">
          选中日期：{date?.toLocaleDateString() ?? '无'}
        </p>
      </div>
    </div>
  )
}
