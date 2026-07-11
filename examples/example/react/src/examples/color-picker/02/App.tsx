import { Space } from '@expcat/tigercat-react/Space'
import { Text } from '@expcat/tigercat-react/Text'
import { useState } from 'react'
import { ColorPicker } from '@expcat/tigercat-react/ColorPicker'

export default function App() {
  const [color, setColor] = useState('#2563eb')

  const [color2, setColor2] = useState('#2563eb')

  return (
    <>
      <Space direction="vertical" size={12}>
        <ColorPicker value={color2} onChange={setColor2} showAlpha format="rgb" />
        <ColorPicker
          value={color2}
          onChange={setColor2}
          presets={['#f5222d', '#fa8c16', '#52c41a', '#1677ff', '#722ed1']}
        />
        <Space size={12}>
          <ColorPicker value="#ccc" size="sm" />
          <ColorPicker value="#ccc" size="lg" />
          <ColorPicker value="#ccc" disabled />
        </Space>
      </Space>
    </>
  )
}
