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
      <Space align="center">
        <Switch checked={sizeSm} size="sm" onChange={setSizeSm} aria-label="小尺寸开关" />
        <Switch checked={sizeMd} size="md" onChange={setSizeMd} aria-label="中尺寸开关" />
        <Switch checked={sizeLg} size="lg" onChange={setSizeLg} aria-label="大尺寸开关" />
      </Space>
    </>
  )
}
