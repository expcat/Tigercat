import React, { useState } from 'react'
import { Slider } from '@expcat/tigercat-react/Slider'
import { Space } from '@expcat/tigercat-react/Space'
import { Text } from '@expcat/tigercat-react/Text'

export default function App() {
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

  return (
    <>
      <Space direction="vertical" className="w-full max-w-md">
        <div className="w-full">
          <Text className="text-sm text-gray-600 mb-2">0-100 (默认)</Text>
          <div className="flex items-center gap-4 w-full">
            <Slider
              value={rangeMinMaxDefaultValue}
              onChange={(val) => setRangeMinMaxDefaultValue(toNumber(val))}
              min={0}
              max={100}
              aria-label="默认范围数值"
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
              aria-label="宽范围数值"
              className="flex-1"
            />
            <Text>{rangeMinMaxWideValue}</Text>
          </div>
        </div>
      </Space>
    </>
  )
}
