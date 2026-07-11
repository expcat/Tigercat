import { useState } from 'react'
import { MarkdownEditor } from '@expcat/tigercat-react/MarkdownEditor'

const initialMarkdown =
  '# Release notes\n\nTigercat supports **Markdown editing** with live preview.'

export default function App() {
  const [content, setContent] = useState(initialMarkdown)

  return (
    <MarkdownEditor
      value={content}
      onChange={setContent}
      defaultMode="split"
      height={320}
      placeholder="Write markdown..."
    />
  )
}
