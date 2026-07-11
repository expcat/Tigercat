import { Affix } from '@expcat/tigercat-react/Affix'

export default function App() {
  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">固定在顶部</h3>
          <div
            id="affix-scroll-container"
            style={{
              height: 100,
              overflow: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 16
            }}>
            <div style={{ height: 300 }}>
              <p className="mb-4">向下滚动触发固定</p>
              <Affix
                offsetTop={0}
                target="#affix-scroll-container"
                onChange={(affixed) => console.log('Affix:', affixed)}>
                <div className="px-4 py-2 bg-blue-500 text-white rounded inline-block">
                  我会固定在顶部
                </div>
              </Affix>
              <p className="mt-4">更多内容...</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">底部固定</h3>
          <Affix offsetBottom={20}>
            <div className="px-4 py-2 bg-green-500 text-white rounded inline-block">
              距底部 20px 固定
            </div>
          </Affix>
        </div>
      </div>
    </>
  )
}
