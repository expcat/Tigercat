import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'

export default function App() {
  const [submitted, setSubmitted] = useState('')

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        setSubmitted(String(data.get('title') ?? ''))
      }}
      onReset={() => setSubmitted('')}>
      <label>
        名称
        <input name="title" defaultValue="Tigercat" style={{ marginInlineStart: 8 }} />
      </label>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Button htmlType="submit">提交</Button>
        <Button htmlType="reset">重置</Button>
      </div>
      {submitted ? <p>已提交 {submitted}</p> : null}
    </form>
  )
}
