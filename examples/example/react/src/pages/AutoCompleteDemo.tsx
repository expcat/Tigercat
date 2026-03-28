import { useState } from 'react'
import { AutoComplete } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const allOptions = ['React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Preact', 'Next.js', 'Nuxt'].map(o => ({ label: o, value: o }))

const basicSnippet = `<AutoComplete
  value={val}
  onChange={setVal}
  options={allOptions}
  placeholder="请输入搜索内容"
/>`

const customSnippet = `<AutoComplete
  value={val}
  onChange={(v) => setVal(String(v))}
  options={allOptions.map(o => ({ label: o.label + ' 框架', value: o.value }))}
  placeholder="自定义选项"
/>`

const AutoCompleteDemo: React.FC = () => {
  const [val, setVal] = useState('')
  const [val2, setVal2] = useState('')

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">AutoComplete 自动补全</h1>
      <p className="text-gray-500 mb-8">输入框自动完成，根据输入内容过滤候选项。</p>

      <DemoBlock title="基本用法" description="输入时自动过滤匹配选项" code={basicSnippet}>
        <AutoComplete value={val} onChange={(v) => setVal(String(v))} options={allOptions} placeholder="请输入搜索内容" />
      </DemoBlock>

      <DemoBlock title="自定义选项" description="options 支持 {label, value} 对象" code={customSnippet}>
        <AutoComplete
          value={val2}
          onChange={(v) => setVal2(String(v))}
          options={allOptions.map(o => ({ label: o.label + ' 框架', value: o.value }))}
          placeholder="自定义选项" />
      </DemoBlock>
    </div>
  )
}

export default AutoCompleteDemo
