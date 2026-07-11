import { useState } from 'react'
import { CodeEditor } from '@expcat/tigercat-react/CodeEditor'

const defaultJs = `function greet(name) {
  console.log('Hello, ' + name)
}

greet('Tigercat')`

const htmlCode = `<div class="container">
  <h1>Hello World</h1>
  <p>This is read-only.</p>
</div>`

export default function App() {
  const [code, setCode] = useState(defaultJs)

  return (
    <>
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">language 设置语言</p>
          <CodeEditor value={code} onChange={setCode} language="javascript" minLines={5} />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">主题 & 只读</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">theme='dark'，readOnly</p>
          <CodeEditor value={htmlCode} language="html" theme="dark" readOnly minLines={5} />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">配置项</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">tabSize、wordWrap、placeholder</p>
          <CodeEditor
            language="css"
            tabSize={4}
            wordWrap
            placeholder="输入 CSS 代码..."
            minLines={4}
            maxLines={10}
          />
        </section>
      </div>
    </>
  )
}
