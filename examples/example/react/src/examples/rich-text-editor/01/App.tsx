import { useState } from 'react'
import { RichTextEditor } from '@expcat/tigercat-react/RichTextEditor'

export default function App() {
  const [content, setContent] = useState('<p>Hello <strong>Tigercat</strong>!</p>')

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      height={260}
      placeholder="在这里编辑富文本..."
    />
  )
}
