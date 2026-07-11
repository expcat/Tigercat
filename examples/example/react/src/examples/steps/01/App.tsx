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
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
          <Steps current={current1}>
            <StepsItem title="已完成" description="这是步骤的描述信息" />
            <StepsItem title="进行中" description="这是步骤的描述信息" />
            <StepsItem title="待完成" description="这是步骤的描述信息" />
          </Steps>
          <div className="mt-6">
            <Button
              onClick={() => prev(setCurrent1, current1)}
              disabled={current1 === 0}
              className="mr-2">
              上一步
            </Button>
            <Button
              onClick={() => next(setCurrent1, current1)}
              disabled={current1 === 2}
              variant="primary">
              下一步
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">迷你版</h3>
          <Steps current={current2} simple>
            <StepsItem title="已完成" />
            <StepsItem title="进行中" />
            <StepsItem title="待完成" />
          </Steps>
          <div className="mt-6">
            <Button
              onClick={() => prev(setCurrent2, current2)}
              disabled={current2 === 0}
              className="mr-2">
              上一步
            </Button>
            <Button
              onClick={() => next(setCurrent2, current2)}
              disabled={current2 === 2}
              variant="primary">
              下一步
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">小尺寸</h3>
          <Steps current={current3} size="small">
            <StepsItem title="步骤 1" description="这是步骤的描述信息" />
            <StepsItem title="步骤 2" description="这是步骤的描述信息" />
            <StepsItem title="步骤 3" description="这是步骤的描述信息" />
          </Steps>
          <div className="mt-6">
            <Button
              onClick={() => prev(setCurrent3, current3)}
              disabled={current3 === 0}
              className="mr-2">
              上一步
            </Button>
            <Button
              onClick={() => next(setCurrent3, current3)}
              disabled={current3 === 2}
              variant="primary">
              下一步
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">错误状态</h3>
          <Steps current={current4} status="error">
            <StepsItem title="已完成" description="这是步骤的描述信息" />
            <StepsItem title="出错了" description="发生了一些错误" />
            <StepsItem title="待完成" description="这是步骤的描述信息" />
          </Steps>
        </div>
      </div>
    </>
  )
}
