import React, { useState } from 'react';
import { Slider, Space, Divider, Text } from '@tigercat/react';

const SliderDemo: React.FC = () => {
  const [basicValue, setBasicValue] = useState(50);

  const [rangeMinMaxDefaultValue, setRangeMinMaxDefaultValue] = useState(50);
  const [rangeMinMaxWideValue, setRangeMinMaxWideValue] = useState(30);

  const [stepValue, setStepValue] = useState(30);

  const [rangeValue, setRangeValue] = useState<[number, number]>([20, 80]);

  const [marksValue, setMarksValue] = useState(25);
  const marks = {
    0: '0°C',
    25: '25°C',
    50: '50°C',
    75: '75°C',
    100: '100°C',
  };

  const [tooltipOffValue, setTooltipOffValue] = useState(50);

  const disabledValue = 75;

  const [sizeSm, setSizeSm] = useState(30);
  const [sizeMd, setSizeMd] = useState(50);
  const [sizeLg, setSizeLg] = useState(70);

  const toNumber = (val: number | [number, number]) =>
    Array.isArray(val) ? val[0] : val;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Slider 滑块</h1>
        <p className="text-gray-600">通过拖动滑块在一个固定区间内进行选择。</p>
      </div>

      {/* 基础用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">基础的滑块用法，显示当前值。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
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
        </div>
        <Divider className="my-6" />
      </section>

      {/* 不同范围 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不同范围</h2>
        <p className="text-gray-600 mb-6">通过 min 和 max 属性设置范围。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
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
        </div>
        <Divider className="my-6" />
      </section>

      {/* 步进 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">步进</h2>
        <p className="text-gray-600 mb-6">通过 step 设置步进值。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
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
        </div>
        <Divider className="my-6" />
      </section>

      {/* 范围选择 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">范围选择</h2>
        <p className="text-gray-600 mb-6">
          通过 range 启用范围选择，此时值为 [min, max]。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
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
        </div>
        <Divider className="my-6" />
      </section>

      {/* 带标记 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">带标记</h2>
        <p className="text-gray-600 mb-6">通过 marks 显示刻度标记。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
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
        </div>
        <Divider className="my-6" />
      </section>

      {/* 工具提示 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">工具提示</h2>
        <p className="text-gray-600 mb-6">
          通过 tooltip 控制是否显示提示（默认开启）。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
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
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 禁用状态 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用状态</h2>
        <p className="text-gray-600 mb-6">通过 disabled 属性禁用滑块。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <div className="flex items-center gap-4 w-full">
              <Slider
                value={disabledValue}
                min={0}
                max={100}
                disabled
                className="flex-1"
              />
              <Text>{disabledValue}</Text>
            </div>
          </Space>
        </div>
      </section>

      {/* 不同尺寸 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不同尺寸</h2>
        <p className="text-gray-600 mb-6">
          Slider 支持 sm / md / lg 三种尺寸。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
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
        </div>
      </section>
    </div>
  );
};

export default SliderDemo;
