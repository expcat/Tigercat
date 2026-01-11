import React from 'react';
import { Link, Space, Divider } from '@tigercat/react';

const LinkDemo: React.FC = () => {
  const handlePreventNavigate = (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Link 链接</h1>
        <p className="text-gray-600">文字超链接。</p>
      </div>

      {/* 链接变体 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">链接变体</h2>
        <p className="text-gray-600 mb-6">
          展示 primary / secondary / default 三种变体（点击不跳转）。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Link href="#" onClick={handlePreventNavigate} variant="primary">
              Primary
            </Link>
            <Link href="#" onClick={handlePreventNavigate} variant="secondary">
              Secondary
            </Link>
            <Link href="#" onClick={handlePreventNavigate} variant="default">
              Default
            </Link>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 链接尺寸 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">链接尺寸</h2>
        <p className="text-gray-600 mb-6">
          展示 sm / md / lg 三种尺寸（点击不跳转）。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Link href="#" onClick={handlePreventNavigate} size="sm">
              Small
            </Link>
            <Link href="#" onClick={handlePreventNavigate} size="md">
              Medium
            </Link>
            <Link href="#" onClick={handlePreventNavigate} size="lg">
              Large
            </Link>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 禁用状态 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用状态</h2>
        <p className="text-gray-600 mb-6">
          禁用后不可点击，移除 href，并从 Tab 顺序移除。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Link href="#" disabled>
              Disabled Link
            </Link>
          </Space>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 下划线 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">下划线</h2>
        <p className="text-gray-600 mb-6">
          underline=true 悬停显示下划线；underline=false 无下划线。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Link href="#" onClick={handlePreventNavigate} underline>
              有下划线（悬停）
            </Link>
            <Link href="#" onClick={handlePreventNavigate} underline={false}>
              无下划线
            </Link>
          </Space>
        </div>
      </section>
    </div>
  );
};

export default LinkDemo;
