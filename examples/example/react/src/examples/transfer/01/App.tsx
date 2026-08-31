import { useState } from 'react'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Transfer } from '@expcat/tigercat-react/Transfer'

const dataSource = [
  { key: 'design', label: '设计' },
  { key: 'frontend', label: '前端' },
  { key: 'backend', label: '后端' },
  { key: 'qa', label: '测试' }
]

export default function App() {
  const [model, setModel] = useState<{ team: (string | number)[] }>({ team: ['frontend'] })

  return (
    <Form model={model} onChange={setModel} labelPosition="top">
      <FormItem name="team" label="团队">
        <Transfer
          dataSource={dataSource}
          value={model.team}
          onChange={(next) => setModel({ team: next })}
          searchable
          className="max-w-2xl"
        />
      </FormItem>
    </Form>
  )
}
