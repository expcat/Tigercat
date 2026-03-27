import { useState } from 'react'
import { ColorPicker, Space, Text } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<ColorPicker value={color} onChange={setColor} />
<Text>选中颜色: {color}</Text>`

const featureSnippet = `<ColorPicker value={color} onChange={setColor} showAlpha format="rgba" />
<ColorPicker value={color} onChange={setColor} presets={['#f5222d', '#fa8c16', '#52c41a', '#1677ff', '#722ed1']} />
<ColorPicker value="#ccc" size="sm" />
<ColorPicker value="#ccc" size="lg" />
<ColorPicker value="#ccc" disabled />`

const ColorPickerDemo: React.FC = () => {
  const [color, setColor] = useState('#2563eb')
  const [color2, setColor2] = useState('#2563eb')

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">ColorPicker 颜色选择器</h1>
      <p className="text-gray-500 mb-8">用于选择颜色，支持透明度、预设颜色和多种格式。</p>

      <DemoBlock title="基本用法" code={basicSnippet}>
        <Space size={16} align="center">
          <ColorPicker value={color} onChange={setColor} />
          <Text>选中颜色: {color}</Text>
        </Space>
      </DemoBlock>

      <DemoBlock title="透明度、预设与尺寸" description="showAlpha 透明度，presets 预设色板" code={featureSnippet}>
        <Space direction="vertical" size={12}>
          <ColorPicker value={color2} onChange={setColor2} showAlpha format="rgba" />
          <ColorPicker value={color2} onChange={setColor2} presets={['#f5222d', '#fa8c16', '#52c41a', '#1677ff', '#722ed1']} />
          <Space size={12}>
            <ColorPicker value="#ccc" size="sm" />
            <ColorPicker value="#ccc" size="lg" />
            <ColorPicker value="#ccc" disabled />
          </Space>
        </Space>
      </DemoBlock>
    </div>
  )
}

export default ColorPickerDemo
