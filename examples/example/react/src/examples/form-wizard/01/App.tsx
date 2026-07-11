import { useState } from 'react'
import { FormWizard } from '@expcat/tigercat-react/FormWizard'
import { Input } from '@expcat/tigercat-react/Input'
import type { WizardStep } from '@expcat/tigercat-core'

const steps: WizardStep[] = [{ title: '填写信息' }, { title: '确认提交' }]

export default function App() {
  const [current, setCurrent] = useState(0)
  const [name, setName] = useState('')
  const [finished, setFinished] = useState(false)

  return (
    <div className="space-y-3">
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
            <Input
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              placeholder="请输入姓名"
            />
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">姓名：{name || '尚未填写'}</p>
          )
        }
      />
      {finished && <p className="text-sm text-green-600">提交完成</p>}
    </div>
  )
}
