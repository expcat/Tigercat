import { Button } from '@expcat/tigercat-react/Button'
import { Card } from '@expcat/tigercat-react/Card'
import { useState } from 'react'
import { Loading } from '@expcat/tigercat-react/Loading'

export default function App() {
  const [pageLoading, setPageLoading] = useState(false)

  const [cardLoading, setCardLoading] = useState(false)

  const [buttonLoading, setButtonLoading] = useState(false)

  const showPageLoading = () => {
    setPageLoading(true)
    setTimeout(() => {
      setPageLoading(false)
    }, 2000)
  }

  const refreshCard = () => {
    setCardLoading(true)
    setTimeout(() => {
      setCardLoading(false)
    }, 1500)
  }

  const handleSubmit = () => {
    setButtonLoading(true)
    setTimeout(() => {
      setButtonLoading(false)
    }, 2000)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="flex gap-8 items-center justify-center">
              <Loading />
              <Loading text="加载中..." />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">加载动画变体</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-5 gap-8">
              <div className="flex flex-col items-center gap-2">
                <Loading variant="spinner" />
                <span className="text-sm text-gray-600">旋转</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Loading variant="ring" />
                <span className="text-sm text-gray-600">环形</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Loading variant="dots" />
                <span className="text-sm text-gray-600">圆点</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Loading variant="bars" />
                <span className="text-sm text-gray-600">条形</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Loading variant="pulse" />
                <span className="text-sm text-gray-600">脉冲</span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">尺寸大小</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="flex gap-8 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loading size="sm" />
                <span className="text-sm text-gray-600">小</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Loading size="md" />
                <span className="text-sm text-gray-600">中</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Loading size="lg" />
                <span className="text-sm text-gray-600">大</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Loading size="xl" />
                <span className="text-sm text-gray-600">超大</span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">颜色变体</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-4 gap-6">
              <div className="flex flex-col items-center gap-2">
                <Loading color="primary" />
                <span className="text-sm text-gray-600">主要色</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Loading color="secondary" />
                <span className="text-sm text-gray-600">次要色</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Loading color="success" />
                <span className="text-sm text-gray-600">成功色</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Loading color="warning" />
                <span className="text-sm text-gray-600">警告色</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Loading color="danger" />
                <span className="text-sm text-gray-600">危险色</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Loading color="info" />
                <span className="text-sm text-gray-600">信息色</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Loading color="default" />
                <span className="text-sm text-gray-600">默认色</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Loading customColor="#ff6b6b" />
                <span className="text-sm text-gray-600">自定义色</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
