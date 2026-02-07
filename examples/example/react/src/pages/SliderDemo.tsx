import React, { useState } from 'react'
import { Slider, Space, Text } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const SliderDemo: React.FC = () => {
  const [basicValue, setBasicValue] = useState(50)

  const [rangeMinMaxDefaultValue, setRangeMinMaxDefaultValue] = useState(50)
  const [rangeMinMaxWideValue, setRangeMinMaxWideValue] = useState(30)

  const [stepValue, setStepValue] = useState(30)

  const [rangeValue, setRangeValue] = useState<[number, number]>([20, 80])

  const [marksValue, setMarksValue] = useState(25)
  const marks = {
    0: '0°C',
    25: '25°C',
    50: '50°C',
    75: '75°C',
    100: '100°C'
  }

  const [tooltipOffValue, setTooltipOffValue] = useState(50)
  const [tooltipOnValue, setTooltipOnValue] = useState(50)

  const disabledValue = 75

  const [sizeSm, setSizeSm] = useState(30)
  const [sizeMd, setSizeMd] = useState(50)
  const [sizeLg, setSizeLg] = useState(70)

  const toNumber = (val: number | [number, number]) => (Array.isArray(val) ? val[0] : val)

  const basicSnippet = `<Space direction="vertical" className="w-full max-w-md">
    <div className="flex items-center gap-4 w-full">
      <Slider value={basicValue} onChange={(val) => setBasicValue(toNumber(val))} min={0} max={100} className="flex-1" />
      <Text>{basicValue}</Text>
    </div>
  </Space>`

  const rangeSnippet = `<Space direction="vertical" className="w-full max-w-md">
    <div className="w-full">
      <Text className="text-sm text-gray-600 mb-2">0-100 (默认)</Text>
      <div className="flex items-center gap-4 w-full">
        <Slider value={rangeMinMaxDefaultValue} onChange={(val) => setRangeMinMaxDefaultValue(toNumber(val))} min={0} max={100} className="flex-1" />
        <Text>{rangeMinMaxDefaultValue}</Text>
      </div>
    </div>
    <div className="w-full">
      <Text className="text-sm text-gray-600 mb-2">0-200</Text>
      <div className="flex items-center gap-4 w-full">
        <Slider value={rangeMinMaxWideValue} onChange={(val) => setRangeMinMaxWideValue(toNumber(val))} min={0} max={200} className="flex-1" />
        <Text>{rangeMinMaxWideValue}</Text>
      </div>
    </div>
  </Space>`

  const stepSnippet = `<Space direction="vertical" className="w-full max-w-md">
    <div className="flex items-center gap-4 w-full">
      <Slider value={stepValue} onChange={(val) => setStepValue(toNumber(val))} min={0} max={100} step={10} className="flex-1" />
      <Text>{stepValue}</Text>
    </div>
  </Space>`

  const rangeValueSnippet = `<Space direction="vertical" className="w-full max-w-md">
    <div className="flex items-center gap-4 w-full">
      <Slider value={rangeValue} onChange={(val) => setRangeValue(val as [number, number])} range min={0} max={100} className="flex-1" />
      <Text>{rangeValue[0]} - {rangeValue[1]}</Text>
    </div>
  </Space>`

  const marksSnippet = `<Space direction="vertical" className="w-full max-w-md">
    <div className="flex items-center gap-4 w-full">
      <Slider value={marksValue} onChange={(val) => setMarksValue(toNumber(val))} min={0} max={100} marks={marks} className="flex-1" />
      <Text>{marksValue}</Text>
    </div>
  </Space>`

  const tooltipSnippet = `<Space direction="vertical" className="w-full max-w-md">
    <div className="w-full">
      <Text className="text-sm text-gray-600 mb-2">tooltip on（默认）</Text>
      <div className="flex items-center gap-4 w-full">
        <Slider value={tooltipOnValue} onChange={(val) => setTooltipOnValue(toNumber(val))} min={0} max={100} className="flex-1" />
        <Text>{tooltipOnValue}</Text>
      </div>
    </div>
    <div className="w-full">
      <Text className="text-sm text-gray-600 mb-2">tooltip off</Text>
      <div className="flex items-center gap-4 w-full">
        <Slider value={tooltipOffValue} onChange={(val) => setTooltipOffValue(toNumber(val))} min={0} max={100} tooltip={false} className="flex-1" />
        <Text>{tooltipOffValue}</Text>
      </div>
    </div>
  </Space>`

  const disabledSnippet = `<Space direction="vertical" className="w-full max-w-md">
    <div className="flex items-center gap-4 w-full">
      <Slider value={disabledValue} min={0} max={100} disabled className="flex-1" />
      <Text>{disabledValue}</Text>
    </div>
  </Space>`

  const sizeSnippet = `<Space direction="vertical" className="w-full max-w-md">
    <div className="w-full">
      <Text className="text-sm text-gray-600 mb-2">sm</Text>
      <div className="flex items-center gap-4 w-full">
        <Slider value={sizeSm} onChange={(val) => setSizeSm(toNumber(val))} size="sm" min={0} max={100} className="flex-1" />
        <Text>{sizeSm}</Text>
      </div>
    </div>
    <div className="w-full">
      <Text className="text-sm text-gray-600 mb-2">md</Text>
      <div className="flex items-center gap-4 w-full">
        <Slider value={sizeMd} onChange={(val) => setSizeMd(toNumber(val))} size="md" min={0} max={100} className="flex-1" />
        <Text>{sizeMd}</Text>
      </div>
    </div>
    <div className="w-full">
      <Text className="text-sm text-gray-600 mb-2">lg</Text>
      <div className="flex items-center gap-4 w-full">
        <Slider value={sizeLg} onChange={(val) => setSizeLg(toNumber(val))} size="lg" min={0} max={100} className="flex-1" />
        <Text>{sizeLg}</Text>
      </div>
    </div>
  </Space>`

  const defaultValueSnippet = `<Space direction="vertical" className="w-full max-w-md">
    <div className="flex items-center gap-4 w-full">
      <Slider defaultValue={60} min={0} max={100} className="flex-1" />
    </div>
  </Space>`

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Slider 滑块</h1>
        <p className="text-gray-600">通过拖动滑块在一个固定区间内进行选择。</p>
      </div>

      {/* 基础用法 */}
      <DemoBlock title="基础用法" description="基础的滑块用法，显示当前值。" code={basicSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <div className="flex items-center gap-4 w-full">
            <Slider
              value={basicValue}
              onChange={(val) => setBasicValue(toNumber(val))}
              min={0}
              max={100}
              className="flex-1"
            />
            <Text>{basicValue}</Text>
          </div>
        </Space>
      </DemoBlock>

      {/* 不同范围 */}
      <DemoBlock title="不同范围" description="通过 min 和 max 属性设置范围。" code={rangeSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <div className="w-full">
            <Text className="text-sm text-gray-600 mb-2">0-100 (默认)</Text>
            <div className="flex items-center gap-4 w-full">
              <Slider
                value={rangeMinMaxDefaultValue}
                onChange={(val) => setRangeMinMaxDefaultValue(toNumber(val))}
                min={0}
                max={100}
                className="flex-1"
              />
              <Text>{rangeMinMaxDefaultValue}</Text>
            </div>
          </div>
          <div className="w-full">
            <Text className="text-sm text-gray-600 mb-2">0-200</Text>
            <div className="flex items-center gap-4 w-full">
              <Slider
                value={rangeMinMaxWideValue}
                onChange={(val) => setRangeMinMaxWideValue(toNumber(val))}
                min={0}
                max={200}
                className="flex-1"
              />
              <Text>{rangeMinMaxWideValue}</Text>
            </div>
          </div>
        </Space>
      </DemoBlock>

      {/* 步进 */}
      <DemoBlock title="步进" description="通过 step 设置步进值。" code={stepSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <div className="flex items-center gap-4 w-full">
            <Slider
              value={stepValue}
              onChange={(val) => setStepValue(toNumber(val))}
              min={0}
              max={100}
              step={10}
              className="flex-1"
            />
            <Text>{stepValue}</Text>
          </div>
        </Space>
      </DemoBlock>

      {/* 范围选择 */}
      <DemoBlock
        title="范围选择"
        description="通过 range 启用范围选择，此时值为 [min, max]。"
        code={rangeValueSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <div className="flex items-center gap-4 w-full">
            <Slider
              value={rangeValue}
              onChange={(val) => setRangeValue(val as [number, number])}
              range
              min={0}
              max={100}
              className="flex-1"
            />
            <Text>
              {rangeValue[0]} - {rangeValue[1]}
            </Text>
          </div>
        </Space>
      </DemoBlock>

      {/* 带标记 */}
      <DemoBlock title="带标记" description="通过 marks 显示刻度标记。" code={marksSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <div className="flex items-center gap-4 w-full">
            <Slider
              value={marksValue}
              onChange={(val) => setMarksValue(toNumber(val))}
              min={0}
              max={100}
              marks={marks}
              className="flex-1"
            />
            <Text>{marksValue}</Text>
          </div>
        </Space>
      </DemoBlock>

      {/* 工具提示 */}
      <DemoBlock
        title="工具提示"
        description="通过 tooltip 控制是否显示提示（默认开启）。"
        code={tooltipSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <div className="w-full">
            <Text className="text-sm text-gray-600 mb-2">tooltip on（默认）</Text>
            <div className="flex items-center gap-4 w-full">
              <Slider
                value={tooltipOnValue}
                onChange={(val) => setTooltipOnValue(toNumber(val))}
                min={0}
                max={100}
                className="flex-1"
              />
              <Text>{tooltipOnValue}</Text>
            </div>
          </div>
          <div className="w-full">
            <Text className="text-sm text-gray-600 mb-2">tooltip off</Text>
            <div className="flex items-center gap-4 w-full">
              <Slider
                value={tooltipOffValue}
                onChange={(val) => setTooltipOffValue(toNumber(val))}
                min={0}
                max={100}
                tooltip={false}
                className="flex-1"
              />
              <Text>{tooltipOffValue}</Text>
            </div>
          </div>
        </Space>
      </DemoBlock>

      {/* 禁用状态 */}
      <DemoBlock title="禁用状态" description="通过 disabled 属性禁用滑块。" code={disabledSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <div className="flex items-center gap-4 w-full">
            <Slider value={disabledValue} min={0} max={100} disabled className="flex-1" />
            <Text>{disabledValue}</Text>
          </div>
        </Space>
      </DemoBlock>

      {/* 不同尺寸 */}
      <DemoBlock
        title="不同尺寸"
        description="Slider 支持 sm / md / lg 三种尺寸。"
        code={sizeSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <div className="w-full">
            <Text className="text-sm text-gray-600 mb-2">sm</Text>
            <div className="flex items-center gap-4 w-full">
              <Slider
                value={sizeSm}
                onChange={(val) => setSizeSm(toNumber(val))}
                size="sm"
                min={0}
                max={100}
                className="flex-1"
              />
              <Text>{sizeSm}</Text>
            </div>
          </div>
          <div className="w-full">
            <Text className="text-sm text-gray-600 mb-2">md</Text>
            <div className="flex items-center gap-4 w-full">
              <Slider
                value={sizeMd}
                onChange={(val) => setSizeMd(toNumber(val))}
                size="md"
                min={0}
                max={100}
                className="flex-1"
              />
              <Text>{sizeMd}</Text>
            </div>
          </div>
          <div className="w-full">
            <Text className="text-sm text-gray-600 mb-2">lg</Text>
            <div className="flex items-center gap-4 w-full">
              <Slider
                value={sizeLg}
                onChange={(val) => setSizeLg(toNumber(val))}
                size="lg"
                min={0}
                max={100}
                className="flex-1"
              />
              <Text>{sizeLg}</Text>
            </div>
          </div>
        </Space>
      </DemoBlock>

      {/* 默认值（非受控） */}
      <DemoBlock
        title="默认值"
        description="通过 defaultValue 设置初始值，无需绱定受控状态（非受控模式）。"
        code={defaultValueSnippet}>
        <Space direction="vertical" className="w-full max-w-md">
          <div className="flex items-center gap-4 w-full">
            <Slider defaultValue={60} min={0} max={100} className="flex-1" />
          </div>
        </Space>
      </DemoBlock>
    </div>
  )
}

export default SliderDemo
