import { Space } from '@expcat/tigercat-react/Space'
import { Text } from '@expcat/tigercat-react/Text'
import { useState } from 'react'
import { CronEditor } from '@expcat/tigercat-react/CronEditor'

export default function App() {
  const [cron, setCron] = useState('0 9 * * 1-5')

  const [advancedCron, setAdvancedCron] = useState('*/15 9-18 * * 1-5')

  const [validationText, setValidationText] = useState('有效表达式')

  return (
    <>
      <Space direction="vertical" size={16}>
        <CronEditor
          value={advancedCron}
          onChange={(next, validation) => {
            setAdvancedCron(next)
            setValidationText(
              validation.valid ? '有效表达式' : (validation.issues[0]?.message ?? '无效表达式')
            )
          }}
        />
        <Text>校验结果: {validationText}</Text>
        <CronEditor defaultValue="0 0 * * *" size="sm" />
        <CronEditor value="60 * * * *" />
        <CronEditor value="0 0 * * *" disabled />
      </Space>
    </>
  )
}
