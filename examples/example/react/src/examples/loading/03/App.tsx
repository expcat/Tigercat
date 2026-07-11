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
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">区域加载</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Card header="数据统计">
              <div className="relative min-h-[200px]">
                {cardLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <Loading text="刷新中..." />
                  </div>
                ) : (
                  <div>
                    <p className="mb-2">总用户数: 1,234</p>
                    <p className="mb-2">活跃用户: 567</p>
                    <p className="mb-4">新增用户: 89</p>
                    <Button onClick={refreshCard}>刷新数据</Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">按钮加载</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="flex gap-4">
              <Button loading={buttonLoading} onClick={handleSubmit}>
                提交
              </Button>
              <Button variant="secondary" loading={buttonLoading} onClick={handleSubmit}>
                保存
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">延迟显示</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="flex gap-8 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loading delay={0} text="无延迟" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <Loading delay={300} text="延迟 300ms" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
