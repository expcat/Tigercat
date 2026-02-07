import React, { useMemo, useRef, useState } from 'react'
import {
  FormWizard,
  Form,
  FormItem,
  Input,
  Alert,
  type FormHandle,
  type WizardStep
} from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<FormWizard
  steps={steps}
  current={current}
  onChange={setCurrent}
  beforeNext={handleBeforeNext}
  onFinish={handleFinish}
  renderStep={(_step, index) => (
    <Form ref={formRef} model={model} className="w-full max-w-md">
      {index === 0 && (
        <>
          <FormItem name="name" label="姓名" required showMessage={false}>
            <Input value={model.name} onChange={...} placeholder="请输入姓名" />
          </FormItem>
          <FormItem name="email" label="邮箱" required showMessage={false}>
            <Input value={model.email} onChange={...} placeholder="请输入邮箱" />
          </FormItem>
        </>
      )}
      {index === 1 && (
        <FormItem name="phone" label="手机号" required showMessage={false}>
          <Input value={model.phone} onChange={...} placeholder="请输入手机号" />
        </FormItem>
      )}
      {index === 2 && (
        <div>确认信息无误后点击完成。</div>
      )}
    </Form>
  )}
/>`

const FormWizardDemo: React.FC = () => {
  const steps = useMemo<WizardStep[]>(
    () => [
      { title: '基本信息', description: '填写姓名与邮箱' },
      { title: '联系方式', description: '填写手机号' },
      { title: '完成', description: '提交并确认' }
    ],
    []
  )

  const [current, setCurrent] = useState(0)
  const [model, setModel] = useState({ name: '', email: '', phone: '' })
  const [finished, setFinished] = useState(false)
  const formRef = useRef<FormHandle | null>(null)

  const handleBeforeNext = async () => {
    const valid = await formRef.current?.validate()
    return valid === true
  }

  const handleFinish = () => {
    setFinished(true)
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">FormWizard 表单向导</h1>
        <p className="text-gray-600">多步表单流，支持校验阻断与完成态。</p>
      </div>

      <DemoBlock title="基础用法" description="多步校验阻断 + 完成态" code={basicSnippet}>
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
      </DemoBlock>
    </div>
  )
}

export default FormWizardDemo
