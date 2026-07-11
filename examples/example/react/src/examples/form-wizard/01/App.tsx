import React, { useMemo, useRef, useState } from 'react'
import { FormWizard } from '@expcat/tigercat-react/FormWizard'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Input } from '@expcat/tigercat-react/Input'
import { Alert } from '@expcat/tigercat-react/Alert'
import { type FormHandle, type WizardStep } from '@expcat/tigercat-react'

export default function App() {
  const steps = useMemo<WizardStep[]>(
    () => [
      { title: '基本信息', description: '填写姓名与邮箱', fields: ['name', 'email'] },
      { title: '联系方式', description: '填写手机号', fields: ['phone'] },
      { title: '完成', description: '提交并确认', fields: [] }
    ],
    []
  )

  const [current, setCurrent] = useState(0)

  const [model, setModel] = useState({ name: '', email: '', phone: '' })

  const [finished, setFinished] = useState(false)

  const [currentLabels, setCurrentLabels] = useState(0)

  const formRef = useRef<FormHandle | null>(null)

  const handleBeforeNext = async (_current: number, step: WizardStep) => {
    const fields = step.fields ?? []
    if (fields.length === 0) {
      return true
    }
    const valid = await formRef.current?.validateFields(fields)
    return valid === true
  }

  const handleFinish = () => {
    setFinished(true)
  }

  return (
    <>
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">多步校验阻断 + 完成态。</p>
          <FormWizard
            steps={steps}
            current={current}
            onChange={(next) => {
              setFinished(false)
              setCurrent(next)
            }}
            beforeNext={handleBeforeNext}
            onFinish={handleFinish}
            renderStep={(_step, index) => (
              <Form ref={formRef} model={model} className="w-full max-w-md">
                {index === 0 && (
                  <>
                    <FormItem
                      name="name"
                      label="姓名"
                      required
                      rules={{ required: true, message: '请输入姓名' }}
                      showMessage={false}>
                      <Input
                        value={model.name}
                        onChange={(event) =>
                          setModel((prev) => ({ ...prev, name: event.target.value }))
                        }
                        placeholder="请输入姓名"
                      />
                    </FormItem>
                    <FormItem
                      name="email"
                      label="邮箱"
                      required
                      rules={{ required: true, message: '请输入邮箱' }}
                      showMessage={false}>
                      <Input
                        value={model.email}
                        onChange={(event) =>
                          setModel((prev) => ({ ...prev, email: event.target.value }))
                        }
                        placeholder="请输入邮箱"
                      />
                    </FormItem>
                  </>
                )}
                {index === 1 && (
                  <FormItem
                    name="phone"
                    label="手机号"
                    required
                    rules={{ required: true, message: '请输入手机号' }}
                    showMessage={false}>
                    <Input
                      value={model.phone}
                      onChange={(event) =>
                        setModel((prev) => ({ ...prev, phone: event.target.value }))
                      }
                      placeholder="请输入手机号"
                    />
                  </FormItem>
                )}
                {index === 2 && (
                  <div className="space-y-3">
                    <div className="text-sm text-(--tiger-text-secondary,#6b7280)">
                      确认信息无误后点击完成。
                    </div>
                    <Alert
                      type={finished ? 'success' : 'info'}
                      description={finished ? '已完成提交' : '等待完成提交'}
                    />
                  </div>
                )}
              </Form>
            )}
          />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            自定义文案 (labels)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            单语言项目无需引入 locale，直接用扁平 labels 覆盖上一步/下一步/完成按钮文案。
          </p>
          <FormWizard
            steps={steps}
            current={currentLabels}
            onChange={setCurrentLabels}
            labels={{ prevText: '返回', nextText: '继续', finishText: '提交完成' }}
            renderStep={(_step, index) => (
              <div className="text-sm text-gray-600">第 {index + 1} 步内容</div>
            )}
          />
        </section>
      </div>
    </>
  )
}
