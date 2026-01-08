import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Textarea, Space, Divider, FormItem } from '@tigercat/react';

const TextareaDemo: React.FC = () => {
  const [text, setText] = useState('');
  const [autoResizeText, setAutoResizeText] = useState('');
  const [limited, setLimited] = useState('');
  const [disabled] = useState('禁用的文本域');
  const [readonly] = useState('只读的文本域');

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Textarea 文本域</h1>
        <p className="text-gray-600">输入多行文本时使用。</p>
      </div>

      {/* 基础用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">基础的文本域组件。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Textarea
              value={text}
              onInput={(e) => setText(e.currentTarget.value)}
              placeholder="请输入内容"
              rows={4}
            />
            <p className="text-sm text-gray-600">输入的内容：{text}</p>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 尺寸 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">尺寸</h2>
        <p className="text-gray-600 mb-6">支持 sm / md / lg 三种尺寸。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <FormItem label="Small">
              <Textarea size="sm" placeholder="Small textarea" />
            </FormItem>
            <FormItem label="Medium">
              <Textarea size="md" placeholder="Medium textarea" />
            </FormItem>
            <FormItem label="Large">
              <Textarea size="lg" placeholder="Large textarea" />
            </FormItem>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 不同行数 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不同行数</h2>
        <p className="text-gray-600 mb-6">通过 rows 属性设置文本域的行数。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <FormItem label="2行">
              <Textarea placeholder="2行文本域" rows={2} />
            </FormItem>
            <FormItem label="4行">
              <Textarea placeholder="4行文本域" rows={4} />
            </FormItem>
            <FormItem label="6行">
              <Textarea placeholder="6行文本域" rows={6} />
            </FormItem>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 自动高度 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">自动高度</h2>
        <p className="text-gray-600 mb-6">
          通过 autoResize 启用自动高度，可配合 minRows / maxRows 限制范围。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <FormItem label="基础自动高度">
              <Textarea
                value={autoResizeText}
                onInput={(e) => setAutoResizeText(e.currentTarget.value)}
                autoResize
                placeholder="输入内容后将自动调整高度"
              />
            </FormItem>
            <FormItem label="限制行数 (3-8)">
              <Textarea
                autoResize
                minRows={3}
                maxRows={8}
                placeholder="最少 3 行，最多 8 行"
              />
            </FormItem>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 字符计数 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">字符计数</h2>
        <p className="text-gray-600 mb-6">
          通过 showCount 显示计数，可配合 maxLength 限制最大字符数。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <FormItem label="仅计数">
              <Textarea showCount placeholder="显示字符数" />
            </FormItem>
            <FormItem label="限制最大长度 (100)">
              <Textarea
                value={limited}
                onInput={(e) => setLimited(e.currentTarget.value)}
                showCount
                maxLength={100}
                placeholder="最多 100 个字符"
              />
            </FormItem>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 禁用和只读 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用和只读</h2>
        <p className="text-gray-600 mb-6">文本域可以设置为禁用或只读状态。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full max-w-md">
            <Textarea value={disabled} disabled rows={3} />
            <Textarea value={readonly} readonly rows={3} />
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

export default TextareaDemo;
