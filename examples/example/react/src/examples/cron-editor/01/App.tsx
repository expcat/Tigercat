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
      <Space direction="vertical" size={12}>
        <CronEditor value={cron} onChange={setCron} />
        <Text>表达式: {cron}</Text>
      </Space>
    </>
  )
}
