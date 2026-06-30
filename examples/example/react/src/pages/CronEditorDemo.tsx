import { Space } from '@expcat/tigercat-react/Space'
import { Text } from '@expcat/tigercat-react/Text'
import { useState } from 'react'
import { CronEditor } from '@expcat/tigercat-react/CronEditor'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './CronEditorDemo.tsx?raw'

const basicSnippet = `<CronEditor value={cron} onChange={setCron} />
<Text>表达式: {cron}</Text>`

const basicScriptSnippet = `import { useState } from 'react'

const [cron, setCron] = useState('0 9 * * 1-5')`

const featureSnippet = `<CronEditor
  value={advancedCron}
  onChange={(next, validation) => {
    setAdvancedCron(next)
    setValidationText(validation.valid ? '有效表达式' : validation.issues[0]?.message ?? '无效表达式')
  }}
/>

<CronEditor defaultValue="0 0 * * *" size="sm" />
<CronEditor value="60 * * * *" />
<CronEditor value="0 0 * * *" disabled />`

const CronEditorDemo: React.FC = () => {
  const [cron, setCron] = useState('0 9 * * 1-5')
  const [advancedCron, setAdvancedCron] = useState('*/15 9-18 * * 1-5')
  const [validationText, setValidationText] = useState('有效表达式')

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-2">CronEditor Cron 编辑器</h1>
      <p className="text-gray-500 mb-8">用于编辑和校验 5 段 Cron 表达式。</p>

      <DemoBlock title="基本用法" code={fullPageSnippet}>
        <Space direction="vertical" size={12}>
          <CronEditor value={cron} onChange={setCron} />
          <Text>表达式: {cron}</Text>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="预设、校验与状态"
        description="支持预设选择、字段可视化编辑和错误提示。"
        code={fullPageSnippet}>
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
      </DemoBlock>
    </div>
  )
}

export default CronEditorDemo
