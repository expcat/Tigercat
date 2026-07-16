import { useMemo, useState } from 'react'
import { FormWizard } from '@expcat/tigercat-react/FormWizard'
import { Input } from '@expcat/tigercat-react/Input'
import type { WizardStep } from '@expcat/tigercat-core'

export default function App() {
  const [current, setCurrent] = useState(0)
  const [name, setName] = useState('')
  const [team, setTeam] = useState('')
  const [includeTeam, setIncludeTeam] = useState(false)
  const [validationMessage, setValidationMessage] = useState('输入至少两个字符后继续。')
  const [finished, setFinished] = useState(false)

  const steps = useMemo<WizardStep[]>(
    () => [
      { title: '账户', description: '异步校验' },
      {
        title: '团队',
        description: '条件步骤',
        skipCondition: () => !includeTeam
      },
      { title: '确认', description: '检查结果' }
    ],
    [includeTeam]
  )

  const validateBeforeNext = async (index: number) => {
    if (index !== 0) return true
    setValidationMessage('正在异步检查用户名…')
    await new Promise<void>((resolve) => setTimeout(resolve, 500))
    if (name.trim().length < 2) {
      setValidationMessage('校验未通过：用户名至少需要两个字符。')
      return false
    }
    setValidationMessage('校验通过，可以继续。')
    return true
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
        <input
          type="checkbox"
          checked={includeTeam}
          onChange={(event) => {
            setIncludeTeam(event.currentTarget.checked)
            setCurrent(0)
            setFinished(false)
          }}
        />
        配置团队信息（取消勾选时自动跳过第二步）
      </label>
      <FormWizard
        steps={steps}
        current={current}
        beforeNext={validateBeforeNext}
        onChange={(next) => {
          setCurrent(next)
          setFinished(false)
        }}
        onFinish={() => setFinished(true)}
        renderStep={(_step, index) => {
          if (index === 0) {
            return (
              <div className="w-full space-y-2">
                <Input
                  value={name}
                  onChange={(event) => setName(event.currentTarget.value)}
                  placeholder="请输入用户名"
                />
                <p className="text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
                  {validationMessage}
                </p>
              </div>
            )
          }
          if (index === 1) {
            return (
              <Input
                value={team}
                onChange={(event) => setTeam(event.currentTarget.value)}
                placeholder="请输入团队名称"
              />
            )
          }
          return (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              用户名：{name}；团队：{includeTeam ? team || '未填写' : '已跳过'}
            </p>
          )
        }}
      />
      {finished && <p className="text-sm text-green-600">流程已完成</p>}
    </div>
  )
}
