import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input, Space, Divider, FormItem } from '@tigercat/react';

const InputDemo: React.FC = () => {
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [limited, setLimited] = useState('');
  const [disabled] = useState('禁用的输入框');
  const [readonly] = useState('只读的输入框');

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Input 输入框</h1>
        <p className="text-gray-600">
          通过鼠标或键盘输入内容，是最基础的表单域的包装。
        </p>
      </div>

      {/* 基础用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">基础的输入框组件。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="请输入内容"
            />
            <p className="text-sm text-gray-600">输入的内容：{text}</p>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 受控与非受控 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">受控与非受控</h2>
        <p className="text-gray-600 mb-6">
          受控模式由 value/onChange 控制；非受控模式使用 defaultValue。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <FormItem label="受控输入">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="受控输入"
              />
            </FormItem>
            <FormItem label="非受控输入">
              <Input defaultValue="非受控默认值" placeholder="非受控输入" />
            </FormItem>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 不同类型 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不同类型</h2>
        <p className="text-gray-600 mb-6">
          Input 支持多种类型，如文本、密码、数字等。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <FormItem label="文本输入">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                type="text"
                placeholder="文本输入"
              />
            </FormItem>
            <FormItem label="密码输入">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="密码输入"
              />
            </FormItem>
            <FormItem label="数字输入">
              <Input type="number" placeholder="数字输入" />
            </FormItem>
            <FormItem label="邮箱输入">
              <Input type="email" placeholder="邮箱输入" />
            </FormItem>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 不同尺寸 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不同尺寸</h2>
        <p className="text-gray-600 mb-6">输入框有三种尺寸：小、中、大。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Input size="sm" placeholder="小尺寸输入框" />
            <Input size="md" placeholder="中尺寸输入框" />
            <Input size="lg" placeholder="大尺寸输入框" />
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 禁用和只读 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用和只读</h2>
        <p className="text-gray-600 mb-6">输入框可以设置为禁用或只读状态。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Input value={disabled} disabled />
            <Input value={readonly} readonly />
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 必填与长度限制 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">必填与长度限制</h2>
        <p className="text-gray-600 mb-6">
          使用 required / minLength / maxLength 约束输入。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <FormItem label="必填输入">
              <Input required placeholder="必填项" />
            </FormItem>
            <FormItem label="长度限制（3~10）">
              <Input
                value={limited}
                onChange={(e) => setLimited(e.target.value)}
                minLength={3}
                maxLength={10}
                placeholder="请输入 3~10 个字符"
              />
              <p className="text-sm text-gray-600">
                当前长度：{limited.length}
              </p>
            </FormItem>
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

export default InputDemo;
