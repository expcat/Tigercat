import React, { useState } from 'react'
import { Steps, StepsItem, Button, Divider } from '@tigercat/react'

const StepsDemo: React.FC = () => {
  const [current1, setCurrent1] = useState(1)
  const [current2, setCurrent2] = useState(1)
  const [current3, setCurrent3] = useState(0)
  const [current4, setCurrent4] = useState(1)
  const [current5, setCurrent5] = useState(0)
  const [current6, setCurrent6] = useState(0)

  const next = (setter: React.Dispatch<React.SetStateAction<number>>, current: number) => {
    if (current < 2) {
      setter(current + 1)
    }
  }

  const prev = (setter: React.Dispatch<React.SetStateAction<number>>, current: number) => {
    if (current > 0) {
      setter(current - 1)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Steps 步骤条</h1>
        <p className="text-gray-600">引导用户按照流程完成任务的导航条。</p>
      </div>

      {/* 基本用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基本用法</h2>
        <p className="text-gray-600 mb-6">简单的步骤条，展示流程进度。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Steps current={current1}>
            <StepsItem title="已完成" description="这是步骤的描述信息" />
            <StepsItem title="进行中" description="这是步骤的描述信息" />
            <StepsItem title="待完成" description="这是步骤的描述信息" />
          </Steps>
          <div className="mt-6">
            <Button 
              onClick={() => prev(setCurrent1, current1)} 
              disabled={current1 === 0}
              className="mr-2"
            >
              上一步
            </Button>
            <Button 
              onClick={() => next(setCurrent1, current1)} 
              disabled={current1 === 2}
              variant="primary"
            >
              下一步
            </Button>
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 迷你版 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">迷你版</h2>
        <p className="text-gray-600 mb-6">简洁的步骤条，不显示描述信息。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Steps current={current2} simple>
            <StepsItem title="已完成" />
            <StepsItem title="进行中" />
            <StepsItem title="待完成" />
          </Steps>
          <div className="mt-6">
            <Button 
              onClick={() => prev(setCurrent2, current2)} 
              disabled={current2 === 0}
              className="mr-2"
            >
              上一步
            </Button>
            <Button 
              onClick={() => next(setCurrent2, current2)} 
              disabled={current2 === 2}
              variant="primary"
            >
              下一步
            </Button>
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 小尺寸 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">小尺寸</h2>
        <p className="text-gray-600 mb-6">使用小尺寸的步骤条。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Steps current={current3} size="small">
            <StepsItem title="步骤 1" description="这是步骤的描述信息" />
            <StepsItem title="步骤 2" description="这是步骤的描述信息" />
            <StepsItem title="步骤 3" description="这是步骤的描述信息" />
          </Steps>
          <div className="mt-6">
            <Button 
              onClick={() => prev(setCurrent3, current3)} 
              disabled={current3 === 0}
              className="mr-2"
            >
              上一步
            </Button>
            <Button 
              onClick={() => next(setCurrent3, current3)} 
              disabled={current3 === 2}
              variant="primary"
            >
              下一步
            </Button>
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 错误状态 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">错误状态</h2>
        <p className="text-gray-600 mb-6">步骤执行出错时的状态展示。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Steps current={current4} status="error">
            <StepsItem title="已完成" description="这是步骤的描述信息" />
            <StepsItem title="出错了" description="发生了一些错误" />
            <StepsItem title="待完成" description="这是步骤的描述信息" />
          </Steps>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 纵向步骤条 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">纵向步骤条</h2>
        <p className="text-gray-600 mb-6">垂直方向的步骤条。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Steps current={current5} direction="vertical">
            <StepsItem title="步骤 1" description="这是步骤 1 的详细描述信息，可以比较长" />
            <StepsItem title="步骤 2" description="这是步骤 2 的详细描述信息" />
            <StepsItem title="步骤 3" description="这是步骤 3 的详细描述信息" />
          </Steps>
          <div className="mt-6">
            <Button 
              onClick={() => prev(setCurrent5, current5)} 
              disabled={current5 === 0}
              className="mr-2"
            >
              上一步
            </Button>
            <Button 
              onClick={() => next(setCurrent5, current5)} 
              disabled={current5 === 2}
              variant="primary"
            >
              下一步
            </Button>
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 可点击步骤 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">可点击步骤</h2>
        <p className="text-gray-600 mb-6">点击步骤标题可以切换步骤。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Steps current={current6} clickable onChange={setCurrent6}>
            <StepsItem title="步骤 1" description="点击标题切换步骤" />
            <StepsItem title="步骤 2" description="点击标题切换步骤" />
            <StepsItem title="步骤 3" description="点击标题切换步骤" />
          </Steps>
          <div className="mt-4 text-gray-600">
            当前步骤: {current6 + 1}
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 自定义图标 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">自定义图标</h2>
        <p className="text-gray-600 mb-6">可以为每个步骤自定义图标。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Steps current={1}>
            <StepsItem
              title="登录"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            <StepsItem
              title="验证"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            />
            <StepsItem
              title="完成"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            />
          </Steps>
        </div>
      </section>
    </div>
  )
}

export default StepsDemo
