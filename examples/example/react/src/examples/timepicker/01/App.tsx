import { FormItem } from '@expcat/tigercat-react/FormItem'
import { TimePicker } from '@expcat/tigercat-react/TimePicker'

export default function App() {
  return (
    <div className="flex flex-col gap-6">
      <FormItem label="时间">
        <TimePicker minTime="09:30" />
      </FormItem>
      <TimePicker format="12" />
    </div>
  )
}
