import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Input } from '@expcat/tigercat-react/Input'
import { Modal } from '@expcat/tigercat-react/Modal'

export default function App() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const save = () => {
    if (!name.trim()) {
      setError('请填写姓名')
      return
    }
    setError('')
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      setOpen(false)
    }, 500)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>编辑资料</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="编辑资料"
        maskClosable={false}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" disabled={saving} onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button loading={saving} onClick={save}>
              保存
            </Button>
          </div>
        }>
        <div className="space-y-3">
          <label className="space-y-1 text-sm">
            <span>姓名</span>
            <Input
              placeholder="请输入姓名"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>邮箱</span>
            <Input
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </Modal>
    </>
  )
}
