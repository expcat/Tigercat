import React, { useState } from 'react';
import { Select, Space, Divider } from '@tigercat/react';

const SelectDemo: React.FC = () => {
  const [basicValue, setBasicValue] = useState<string | number>('');
  const [defaultValue, setDefaultValue] = useState<string | number>('china');
  const [disabledValue] = useState<string | number>('china');

  const [sizeSmValue, setSizeSmValue] = useState<string | number>('option1');
  const [sizeMdValue, setSizeMdValue] = useState<string | number>('option2');
  const [sizeLgValue, setSizeLgValue] = useState<string | number>('option3');

  const [disabledOptionValue, setDisabledOptionValue] = useState<
    string | number
  >('');

  const [clearableValue, setClearableValue] = useState<string | number>(
    'option2'
  );
  const [notClearableValue, setNotClearableValue] = useState<string | number>(
    'option2'
  );

  const [searchableValue, setSearchableValue] = useState<string | number>('');
  const [lastSearchQuery, setLastSearchQuery] = useState('');

  const [multipleValue, setMultipleValue] = useState<(string | number)[]>([
    'option1',
    'option3',
  ]);

  const [groupedValue, setGroupedValue] = useState<string | number>('apple');

  const [emptyValue, setEmptyValue] = useState<string | number>('');

  const options = [
    { label: '选项 1', value: 'option1' },
    { label: '选项 2', value: 'option2' },
    { label: '选项 3', value: 'option3' },
    { label: '选项 4', value: 'option4' },
  ];

  const optionsWithDisabled = [
    { label: '可用选项', value: 'enabled' },
    { label: '禁用选项', value: 'disabled', disabled: true },
    { label: '另一个选项', value: 'another' },
  ];

  const countries = [
    { label: '中国', value: 'china' },
    { label: '美国', value: 'usa' },
    { label: '日本', value: 'japan' },
    { label: '英国', value: 'uk' },
    { label: '法国', value: 'france' },
  ];

  const groupedOptions = [
    {
      label: '水果',
      options: [
        { label: '苹果', value: 'apple' },
        { label: '香蕉', value: 'banana' },
        { label: '橙子', value: 'orange' },
      ],
    },
    {
      label: '蔬菜',
      options: [
        { label: '西红柿', value: 'tomato' },
        { label: '黄瓜', value: 'cucumber' },
        { label: '土豆', value: 'potato' },
      ],
    },
  ];

  const toSingleValue = (
    value: string | number | (string | number)[] | undefined
  ) => (Array.isArray(value) ? value[0] ?? '' : value ?? '');

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Select 选择器</h1>
        <p className="text-gray-600">
          当选项过多时，使用下拉菜单展示并选择内容。
        </p>
      </div>

      {/* 基础用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">适用广泛的基础选择器。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Select
              value={basicValue}
              onChange={(v) => setBasicValue(toSingleValue(v))}
              options={options}
              placeholder="请选择"
            />
            <p className="text-sm text-gray-600">
              选中的值：{basicValue || '未选择'}
            </p>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 有默认值 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">有默认值</h2>
        <p className="text-gray-600 mb-6">可以设置默认选中的值。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Select
              value={defaultValue}
              onChange={(v) => setDefaultValue(toSingleValue(v))}
              options={countries}
            />
            <p className="text-sm text-gray-600">选中的国家：{defaultValue}</p>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 禁用状态 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用状态</h2>
        <p className="text-gray-600 mb-6">禁用整个选择器组件。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Select
              value={disabledValue}
              onChange={(v) => setDefaultValue(toSingleValue(v))}
              options={countries}
              disabled
            />
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 不同尺寸 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不同尺寸</h2>
        <p className="text-gray-600 mb-6">
          Select 支持 sm / md / lg 三种尺寸。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <div className="w-full">
              <p className="text-sm text-gray-600 mb-2">sm</p>
              <Select
                value={sizeSmValue}
                onChange={(v) => setSizeSmValue(toSingleValue(v))}
                options={options}
                size="sm"
              />
            </div>
            <div className="w-full">
              <p className="text-sm text-gray-600 mb-2">md</p>
              <Select
                value={sizeMdValue}
                onChange={(v) => setSizeMdValue(toSingleValue(v))}
                options={options}
                size="md"
              />
            </div>
            <div className="w-full">
              <p className="text-sm text-gray-600 mb-2">lg</p>
              <Select
                value={sizeLgValue}
                onChange={(v) => setSizeLgValue(toSingleValue(v))}
                options={options}
                size="lg"
              />
            </div>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 禁用选项 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用选项</h2>
        <p className="text-gray-600 mb-6">可以禁用单个选项。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Select
              value={disabledOptionValue}
              onChange={(v) => setDisabledOptionValue(toSingleValue(v))}
              options={optionsWithDisabled}
              placeholder="请选择"
            />
            <p className="text-sm text-gray-600">
              选中的值：{disabledOptionValue || '未选择'}
            </p>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 可清空 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">可清空</h2>
        <p className="text-gray-600 mb-6">默认支持清空，也可以关闭清空功能。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <div className="w-full">
              <p className="text-sm text-gray-600 mb-2">clearable: true</p>
              <Select
                value={clearableValue}
                onChange={(v) => setClearableValue(toSingleValue(v))}
                options={options}
              />
            </div>
            <div className="w-full">
              <p className="text-sm text-gray-600 mb-2">clearable: false</p>
              <Select
                value={notClearableValue}
                onChange={(v) => setNotClearableValue(toSingleValue(v))}
                options={options}
                clearable={false}
              />
            </div>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 可搜索 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">可搜索</h2>
        <p className="text-gray-600 mb-6">
          启用 searchable 后可在下拉中输入关键字过滤选项。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Select
              value={searchableValue}
              onChange={(v) => setSearchableValue(toSingleValue(v))}
              options={countries}
              searchable
              placeholder="搜索国家"
              onSearch={(q) => setLastSearchQuery(q)}
            />
            <p className="text-sm text-gray-600">
              最近一次搜索：{lastSearchQuery || '（无）'}
            </p>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 多选 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">多选</h2>
        <p className="text-gray-600 mb-6">启用 multiple 后可选择多个选项。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Select
              value={multipleValue}
              onChange={(v) =>
                setMultipleValue((v as (string | number)[]) ?? [])
              }
              options={options}
              multiple
              placeholder="请选择多个"
            />
            <p className="text-sm text-gray-600">
              选中：{multipleValue.length ? multipleValue.join(', ') : '未选择'}
            </p>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 分组选项 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">分组选项</h2>
        <p className="text-gray-600 mb-6">
          支持传入分组数据（group label + options）。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Select
              value={groupedValue}
              onChange={(v) => setGroupedValue(toSingleValue(v))}
              options={groupedOptions}
            />
            <p className="text-sm text-gray-600">选中的值：{groupedValue}</p>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 空状态 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">空状态</h2>
        <p className="text-gray-600 mb-6">
          当 options 为空时，会显示空提示文案。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Select
              value={emptyValue}
              onChange={(v) => setEmptyValue(toSingleValue(v))}
              options={[]}
              noDataText="暂无数据"
              placeholder="无可用选项"
            />
          </Space>
        </div>
      </section>
    </div>
  );
};

export default SelectDemo;
