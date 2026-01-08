import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Switch, Space, Divider } from '@tigercat/react';

const SwitchDemo: React.FC = () => {
  const [basicEnabled, setBasicEnabled] = useState(true);

  const disabledOn = true;
  const disabledOff = false;

  const [sizeSm, setSizeSm] = useState(false);
  const [sizeMd, setSizeMd] = useState(true);
  const [sizeLg, setSizeLg] = useState(false);

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Switch 开关</h1>
        <p className="text-gray-600">
          表示两种相互对立的状态间的切换，多用于触发「开/关」。
        </p>
      </div>

      {/* 基础用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">绑定到一个 Boolean 类型的变量。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical">
            <div className="flex items-center gap-3">
              <Switch checked={basicEnabled} onChange={setBasicEnabled} />
              <span className="text-sm text-gray-600">
                {basicEnabled ? '开启' : '关闭'}
              </span>
            </div>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 禁用状态 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用状态</h2>
        <p className="text-gray-600 mb-6">通过设置 disabled 属性来禁用开关。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Switch checked={disabledOn} disabled />
            <Switch checked={disabledOff} disabled />
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 不同尺寸 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不同尺寸</h2>
        <p className="text-gray-600 mb-6">开关有三种尺寸。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space align="center">
            <Switch checked={sizeSm} size="sm" onChange={setSizeSm} />
            <Switch checked={sizeMd} size="md" onChange={setSizeMd} />
            <Switch checked={sizeLg} size="lg" onChange={setSizeLg} />
          </Space>
        </div>
      </section>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          ← 返回首页
        </Link>
      </div>
    </div>
  );
};

export default SwitchDemo;
