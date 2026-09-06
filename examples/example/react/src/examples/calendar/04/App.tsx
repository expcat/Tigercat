import { Calendar } from '@expcat/tigercat-react/Calendar'

const june = new Date(2024, 5, 15)
const events = [
  { key: 'ship', title: '发版', date: '2024-06-15', color: '#2563eb' },
  { key: 'review', title: '评审', date: '2024-06-18', color: '#16a34a' }
]

export default function App() {
  return (
    <Calendar
      defaultValue={june}
      now={june}
      events={events}
      fullscreen
      dateCellRender={(_date, extra) =>
        extra.events.length > 0 ? (
          <span className="text-[10px] leading-none">{extra.events.length}</span>
        ) : null
      }
    />
  )
}
