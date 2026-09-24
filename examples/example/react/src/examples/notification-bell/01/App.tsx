import { useState } from 'react'
import { NotificationBell } from '@expcat/tigercat-react/NotificationBell'
import type { NotificationItem } from '@expcat/tigercat-core'

const seed: NotificationItem[] = [
  { id: '1', title: 'Approved', read: false },
  { id: '2', title: 'Weekly report', read: true }
]

export default function App() {
  const [items, setItems] = useState(seed)
  return (
    <NotificationBell
      items={items}
      onItemReadChange={(item, read) => {
        setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, read } : entry)))
      }}
    />
  )
}
