import React from 'react'
import { Icon } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<div className="flex items-center gap-6">
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
</div>`

const sizeSnippet = `<div className="flex items-center gap-6">
  <Icon size="sm">…</Icon>
  <Icon size="md">…</Icon>
  <Icon size="lg">…</Icon>
  <Icon size="xl">…</Icon>
</div>`

const colorSnippet = `<div className="flex items-center gap-8">
  <div className="text-blue-600">
    <Icon>
      <svg><path d="M5 13l4 4L19 7" /></svg>
    </Icon>
  </div>
  <Icon color="#ef4444">
    <svg><path d="M12 21.35l-1.45-1.32…" /></svg>
  </Icon>
</div>`

const filledSnippet = `<div className="flex items-center gap-6">
  <Icon size="lg">
    <svg viewBox="0 0 20 20" fill="currentColor" stroke="none">
      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293…" />
    </svg>
  </Icon>
  <Icon size="lg" color="#ef4444">
    <svg viewBox="0 0 20 20" fill="currentColor" stroke="none">
      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293…" />
    </svg>
  </Icon>
</div>`

const a11ySnippet = `{/* 装饰性图标（默认 aria-hidden） */}
<Icon>
  <svg><path d="M5 13l4 4L19 7" /></svg>
</Icon>

{/* 语义化图标（自动获得 role="img"） */}
<Icon aria-label="搜索">
  <svg><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
</Icon>`

const IconDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Icon 图标</h1>
        <p className="text-gray-600">语义化的矢量图形。</p>
      </div>

      {/* 基础用法 */}
      <DemoBlock
        title="基础用法"
        description="基础的 Icon 用法，传入 SVG 内容即可。组件自动注入默认的 stroke 样式属性。"
        code={basicSnippet}>
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
      </DemoBlock>

      {/* 图标尺寸 */}
      <DemoBlock title="图标尺寸" description="支持 sm/md/lg/xl 四种尺寸。" code={sizeSnippet}>
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
      </DemoBlock>

      {/* 颜色定制 */}
      <DemoBlock
        title="颜色定制"
        description="默认继承文本颜色，也可以通过 color 属性指定。"
        code={colorSnippet}>
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
      </DemoBlock>

      {/* 填充图标 */}
      <DemoBlock
        title="填充图标"
        description="通过 SVG 属性 fill='currentColor' stroke='none' 切换为填充风格。"
        code={filledSnippet}>
        <div className="flex items-center gap-6">
          <Icon size="lg">
            <svg viewBox="0 0 20 20" fill="currentColor" stroke="none">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
          </Icon>
          <Icon size="lg" color="#ef4444">
            <svg viewBox="0 0 20 20" fill="currentColor" stroke="none">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            </svg>
          </Icon>
        </div>
      </DemoBlock>

      {/* 无障碍 */}
      <DemoBlock
        title="无障碍"
        description="无 aria-label 时自动隐藏（装饰性）；提供 aria-label 后获得 role=img（语义化）。"
        code={a11ySnippet}>
        <div className="flex items-center gap-8">
          <Icon>
            <svg>
              <path d="M5 13l4 4L19 7" />
            </svg>
          </Icon>
          <Icon aria-label="搜索">
            <svg>
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Icon>
        </div>
      </DemoBlock>
    </div>
  )
}

export default IconDemo
