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
      <Space>
        <Switch checked={disabledOn} disabled aria-label="已开启的禁用开关" />
        <Switch checked={disabledOff} disabled aria-label="已关闭的禁用开关" />
      </Space>
    </>
  )
}
