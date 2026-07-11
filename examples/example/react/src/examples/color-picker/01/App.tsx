import { Space } from '@expcat/tigercat-react/Space'
import { Text } from '@expcat/tigercat-react/Text'
import { useState } from 'react'
import { ColorPicker } from '@expcat/tigercat-react/ColorPicker'

export default function App() {
  const [color, setColor] = useState('#2563eb')

  const [color2, setColor2] = useState('#2563eb')

  return (
    <>
      <Space size={16} align="center">
        <ColorPicker value={color} onChange={setColor} />
        <Text>选中颜色: {color}</Text>
      </Space>
    </>
  )
}
