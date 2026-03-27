import { useState } from 'react'
import { CodeEditor } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const defaultJs = `function greet(name) {
  console.log('Hello, ' + name)
}

greet('Tigercat')`

const htmlCode = `<div class="container">
  <h1>Hello World</h1>
  <p>This is read-only.</p>
</div>`

const basicSnippet = `<CodeEditor value={code} onChange={setCode} language="javascript" minLines={5} />`

const themeSnippet = `<CodeEditor value={code} language="html" theme="dark" readOnly minLines={5} />`

const configSnippet = `<CodeEditor
  language="css" tabSize={4} wordWrap
  placeholder="输入 CSS 代码..." minLines={4} maxLines={10} />`

const CodeEditorDemo: React.FC = () => {
  const [code, setCode] = useState(defaultJs)

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">CodeEditor 代码编辑器</h1>
      <p className="text-gray-500 mb-8">轻量级代码编辑器，支持语法高亮、行号和主题切换。</p>

      <DemoBlock title="基础用法" description="language 设置语言" code={basicSnippet}>
        <CodeEditor value={code} onChange={setCode} language="javascript" minLines={5} />
      </DemoBlock>

      <DemoBlock title="主题 & 只读" description="theme='dark'，readOnly" code={themeSnippet}>
        <CodeEditor value={htmlCode} language="html" theme="dark" readOnly minLines={5} />
      </DemoBlock>

      <DemoBlock title="配置项" description="tabSize、wordWrap、placeholder" code={configSnippet}>
        <CodeEditor
          language="css"
          tabSize={4}
          wordWrap
          placeholder="输入 CSS 代码..."
          minLines={4}
          maxLines={10} />
      </DemoBlock>
    </div>
  )
}

export default CodeEditorDemo
