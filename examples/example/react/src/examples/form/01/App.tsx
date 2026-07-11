import { useState } from 'react'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Input } from '@expcat/tigercat-react/Input'

export default function App() {
  const [model, setModel] = useState({ name: '' })

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <Form model={model} labelPosition="top">
        <FormItem name="name" label="名称">
          <Input
            value={model.name}
            onChange={(event) => setModel({ name: event.target.value })}
            placeholder="请输入名称"
          />
        </FormItem>
      </Form>
      <pre className="overflow-auto rounded bg-gray-50 p-3 text-sm dark:bg-gray-900">
        {JSON.stringify(model, null, 2)}
      </pre>
    </div>
  )
}
