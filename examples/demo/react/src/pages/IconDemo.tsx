import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@tigercat/react';

const IconDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Icon 图标</h1>
        <p className="text-gray-600">语义化的矢量图形。</p>
      </div>

      {/* 基础用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础用法</h2>
        <p className="text-gray-600 mb-6">基础的 Icon 用法。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-6">
            <Icon>
              <svg>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </Icon>
            <Icon>
              <svg>
                <path d="M5 13l4 4L19 7" />
              </svg>
            </Icon>
            <Icon>
              <svg>
                <path d="M18 8a6 6 0 01-7 5.91A6 6 0 116 8a6 6 0 0112 0z" />
              </svg>
            </Icon>
          </div>
        </div>
      </section>

      {/* 图标尺寸 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">图标尺寸</h2>
        <p className="text-gray-600 mb-6">支持 sm/md/lg/xl 四种尺寸。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-6">
            <Icon size="sm">
              <svg>
                <circle cx="12" cy="12" r="10" />
              </svg>
            </Icon>
            <Icon size="md">
              <svg>
                <circle cx="12" cy="12" r="10" />
              </svg>
            </Icon>
            <Icon size="lg">
              <svg>
                <circle cx="12" cy="12" r="10" />
              </svg>
            </Icon>
            <Icon size="xl">
              <svg>
                <circle cx="12" cy="12" r="10" />
              </svg>
            </Icon>
          </div>
        </div>
      </section>

      {/* 颜色定制 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">颜色定制</h2>
        <p className="text-gray-600 mb-6">
          默认继承文本颜色，也可以通过 color 属性指定。
        </p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-8">
            <div className="text-blue-600">
              <Icon>
                <svg>
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </Icon>
            </div>
            <Icon color="#ef4444">
              <svg>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6.01 4.01 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 17.99 4 20 6.01 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </Icon>
          </div>
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

export default IconDemo;
