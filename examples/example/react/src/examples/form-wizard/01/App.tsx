import { useState } from 'react'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { FormWizard } from '@expcat/tigercat-react/FormWizard'
import { Input } from '@expcat/tigercat-react/Input'
import type { WizardStep } from '@expcat/tigercat-core'

const steps: WizardStep[] = [{ title: '填写信息', fields: ['name'] }, { title: '确认提交' }]

export default function App() {
  const [current, setCurrent] = useState(0)
  const [model, setModel] = useState({ name: '' })
  const [finished, setFinished] = useState(false)

  return (
    <div className="space-y-3">
      <Form
        model={model}
        rules={{ name: [{ required: true, message: '请输入姓名' }] }}
        onChange={setModel}
        onSubmit={({ valid }) => {
          if (valid) setFinished(true)
        }}>
        <FormWizard
          steps={steps}
          current={current}
          onChange={(next) => {
            setCurrent(next)
            setFinished(false)
          }}
          onFinish={() => setFinished(true)}
          labels={{ prevText: '返回', nextText: '继续', finishText: '提交' }}
          renderStep={(_step, index) =>
            index === 0 ? (
              <FormItem name="name" label="姓名">
                <Input placeholder="请输入姓名" />
              </FormItem>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                姓名：{model.name || '尚未填写'}
              </p>
            )
          }
        />
      </Form>
      {finished && <p className="text-sm text-green-600">提交完成</p>}
    </div>
  )
}
