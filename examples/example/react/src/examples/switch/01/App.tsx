import React, { useState } from 'react'
import { Switch } from '@expcat/tigercat-react/Switch'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  const [basicEnabled, setBasicEnabled] = useState(true)

  const disabledOn = true

  const disabledOff = false

  const [sizeSm, setSizeSm] = useState(false)

  const [sizeMd, setSizeMd] = useState(true)

  const [sizeLg, setSizeLg] = useState(false)

  return (
    <>
      <Space direction="vertical">
        <div className="flex items-center gap-3">
          <Switch checked={basicEnabled} onChange={setBasicEnabled} aria-label="开启消息通知" />
          <span className="text-sm text-gray-600">{basicEnabled ? '开启' : '关闭'}</span>
        </div>
      </Space>
    </>
  )
}
