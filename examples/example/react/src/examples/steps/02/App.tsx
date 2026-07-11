import React, { useState } from 'react'
import { Steps } from '@expcat/tigercat-react/Steps'
import { StepsItem } from '@expcat/tigercat-react/StepsItem'
import { Button } from '@expcat/tigercat-react/Button'

export default function App() {
  const [current1, setCurrent1] = useState(1)

  const [current2, setCurrent2] = useState(1)

  const [current3, setCurrent3] = useState(0)

  const [current4] = useState(1)

  const [current5, setCurrent5] = useState(0)

  const [current6, setCurrent6] = useState(0)

  const [current7, setCurrent7] = useState(0)

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
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">纵向步骤条</h3>
          <Steps current={current5} direction="vertical">
            <StepsItem title="步骤 1" description="这是步骤 1 的详细描述信息，可以比较长" />
            <StepsItem title="步骤 2" description="这是步骤 2 的详细描述信息" />
            <StepsItem title="步骤 3" description="这是步骤 3 的详细描述信息" />
          </Steps>
          <div className="mt-6">
            <Button
              onClick={() => prev(setCurrent5, current5)}
              disabled={current5 === 0}
              className="mr-2">
              上一步
            </Button>
            <Button
              onClick={() => next(setCurrent5, current5)}
              disabled={current5 === 2}
              variant="primary">
              下一步
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">可点击步骤</h3>
          <Steps current={current6} clickable onChange={setCurrent6}>
            <StepsItem title="步骤 1" description="点击标题切换步骤" />
            <StepsItem title="步骤 2" description="点击标题切换步骤" />
            <StepsItem title="步骤 3" description="点击标题切换步骤" />
          </Steps>
          <div className="mt-4 text-gray-600">当前步骤: {current6 + 1}</div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义图标</h3>
          <Steps current={1}>
            <StepsItem
              title="登录"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
            />
            <StepsItem
              title="验证"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              }
            />
            <StepsItem
              title="完成"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              }
            />
          </Steps>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用步骤</h3>
          <Steps current={current7} clickable onChange={setCurrent7}>
            <StepsItem title="步骤 1" description="可点击的步骤" />
            <StepsItem title="步骤 2" description="该步骤已禁用" disabled />
            <StepsItem title="步骤 3" description="可点击的步骤" />
          </Steps>
          <div className="mt-4 text-gray-600">当前步骤: {current7 + 1}</div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义步骤状态</h3>
          <Steps current={2}>
            <StepsItem title="已完成" description="自动推导为 finish" />
            <StepsItem title="自定义错误" description="status 覆盖自动状态" status="error" />
            <StepsItem title="处理中" description="当前步骤" />
          </Steps>
        </div>
      </div>
    </>
  )
}
