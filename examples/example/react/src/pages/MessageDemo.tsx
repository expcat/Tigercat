import { useRef, useState } from 'react'
import { Message, Button, List } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

export default function MessageDemo() {
  const manualLoadingCloseFnsRef = useRef<Array<() => void>>([])
  const [manualLoadingCount, setManualLoadingCount] = useState(0)

  const tips = [
    '消息默认会在 3 秒后自动关闭',
    'loading 类型的消息不会自动关闭，需要手动关闭',
    '多条消息会依次排列显示，形成队列',
    '可以通过 Message.clear() 清空所有正在显示的消息',
    'Message 与 Alert 的区别：Message 是全局提示，Alert 是页面内嵌提示'
  ]

  const demoCardClassName =
    'p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40'

  const buttonBaseClassName =
    'px-4 py-2 rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950'

  const primaryButtonClassName = `${buttonBaseClassName} bg-blue-600 hover:bg-blue-700 focus:ring-blue-400`
  const successButtonClassName = `${buttonBaseClassName} bg-green-600 hover:bg-green-700 focus:ring-green-400`
  const warningButtonClassName = `${buttonBaseClassName} bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-400`
  const dangerButtonClassName = `${buttonBaseClassName} bg-red-600 hover:bg-red-700 focus:ring-red-400`
  const neutralButtonClassName = `${buttonBaseClassName} bg-gray-600 hover:bg-gray-700 focus:ring-gray-400`
  const purpleButtonClassName = `${buttonBaseClassName} bg-purple-600 hover:bg-purple-700 focus:ring-purple-400`

  const basicSnippet = `<div className="flex flex-wrap gap-2">
  <Button className={primaryButtonClassName} onClick={showInfo}>
    信息
  </Button>
  <Button className={successButtonClassName} onClick={showSuccess}>
    成功
  </Button>
  <Button className={warningButtonClassName} onClick={showWarning}>
    警告
  </Button>
  <Button className={dangerButtonClassName} onClick={showError}>
    错误
  </Button>
  <Button className={neutralButtonClassName} onClick={showLoading}>
    加载
  </Button>
</div>`

  const durationSnippet = `<div className="flex flex-wrap gap-2">
  <Button className={primaryButtonClassName} onClick={showShortMessage}>
    短时间（1秒）
  </Button>
  <Button className={successButtonClassName} onClick={showLongMessage}>
    长时间（5秒）
  </Button>
  <Button className={warningButtonClassName} onClick={showPersistentMessage}>
    不自动关闭
  </Button>
</div>`

  const manualSnippet = `<div className="flex flex-wrap gap-2 mb-4">
  <Button className={primaryButtonClassName} onClick={showClosableMessage}>
    显示可关闭消息
  </Button>
</div>
<div className="flex flex-wrap gap-2 items-center">
  <Button className={primaryButtonClassName} onClick={showMessage}>
    显示加载消息
  </Button>
  <Button className={dangerButtonClassName} onClick={closeManually} disabled={manualLoadingCount === 0}>
    关闭最后一个
  </Button>
  <Button className={dangerButtonClassName} onClick={closeAllManual} disabled={manualLoadingCount === 0}>
    关闭全部
  </Button>
  <span className="text-sm text-gray-600 dark:text-gray-300">当前可手动关闭：\${manualLoadingCount} 条</span>
</div>`

  const flowSnippet = `<Button
  className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
  onClick={simulateRequest}>
  提交表单（模拟请求）
</Button>`

  const queueSnippet = `<div className="flex flex-wrap gap-2">
  <Button className={primaryButtonClassName} onClick={showMultipleMessages}>
    显示多条消息
  </Button>
  <Button className={dangerButtonClassName} onClick={clearAll}>
    清空所有消息
  </Button>
</div>`

  const callbackSnippet = `<Button className={successButtonClassName} onClick={showMessageWithCallback}>
  显示消息（带回调）
</Button>`

  const customSnippet = `<Button className={purpleButtonClassName} onClick={showCustomClass}>
  自定义样式
</Button>`

  const customIconSnippet = `<Button className={primaryButtonClassName} onClick={showCustomIcon}>
  自定义图标
</Button>`

  const sceneSnippet = `<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className={demoCardClassName}>
    <h3 className="text-lg font-semibold mb-3">文件上传</h3>
    <Button
      className={primaryButtonClassName}
      onClick={() => {
        const close = Message.loading('正在上传文件...')
        setTimeout(() => {
          close()
          Message.success('文件上传成功')
        }, 2000)
      }}>
      上传文件
    </Button>
  </div>

  <div className={demoCardClassName}>
    <h3 className="text-lg font-semibold mb-3">保存设置</h3>
    <Button
      className={successButtonClassName}
      onClick={() => {
        const close = Message.loading('正在保存设置...')
        setTimeout(() => {
          close()
          Message.success({ content: '设置保存成功', duration: 2000 })
        }, 1000)
      }}>
      保存设置
    </Button>
  </div>

  <div className={demoCardClassName}>
    <h3 className="text-lg font-semibold mb-3">删除确认</h3>
    <Button
      className={dangerButtonClassName}
      onClick={() => {
        Message.warning({ content: '确定要删除这条记录吗？', duration: 5000, closable: true })
      }}>
      删除记录
    </Button>
  </div>

  <div className={demoCardClassName}>
    <h3 className="text-lg font-semibold mb-3">网络错误</h3>
    <Button
      className={warningButtonClassName}
      onClick={() => {
        Message.error({ content: '网络连接失败，请检查您的网络设置', duration: 0, closable: true })
      }}>
      模拟网络错误
    </Button>
  </div>
</div>`

  const showInfo = () => {
    Message.info('这是一条信息提示')
  }

  const showSuccess = () => {
    Message.success('操作成功！')
  }

  const showWarning = () => {
    Message.warning('请注意相关事项')
  }

  const showError = () => {
    Message.error('操作失败，请重试')
  }

  const showLoading = () => {
    const close = Message.loading('加载中...')
    setTimeout(close, 3000)
  }

  const showShortMessage = () => {
    Message.info({
      content: '这条消息1秒后关闭',
      duration: 1000
    })
  }

  const showLongMessage = () => {
    Message.success({
      content: '这条消息5秒后关闭',
      duration: 5000
    })
  }

  const showPersistentMessage = () => {
    Message.warning({
      content: '这条消息需要手动关闭',
      duration: 0,
      closable: true
    })
  }

  const showClosableMessage = () => {
    Message.info({
      content: '这条消息可以手动关闭',
      closable: true,
      duration: 0
    })
  }

  const showMessage = () => {
    const nextIndex = manualLoadingCloseFnsRef.current.length + 1
    const close = Message.loading(`正在处理请求...（${nextIndex}）`)
    manualLoadingCloseFnsRef.current.push(close)
    setManualLoadingCount(manualLoadingCloseFnsRef.current.length)
  }

  const closeManually = () => {
    const close = manualLoadingCloseFnsRef.current.pop()
    if (close) {
      close()
      setManualLoadingCount(manualLoadingCloseFnsRef.current.length)
    }
  }

  const closeAllManual = () => {
    const closers = manualLoadingCloseFnsRef.current
    manualLoadingCloseFnsRef.current = []
    for (const close of closers) {
      close()
    }
    setManualLoadingCount(0)
  }

  const simulateRequest = async () => {
    const close = Message.loading('正在提交表单...')

    // 模拟异步请求
    await new Promise((resolve) => setTimeout(resolve, 2000))

    close()
    Message.success({
      content: '表单提交成功！',
      duration: 3000,
      onClose: () => {
        console.log('成功消息已关闭')
      }
    })
  }

  const showMultipleMessages = () => {
    Message.info('消息 1')
    setTimeout(() => Message.success('消息 2'), 300)
    setTimeout(() => Message.warning('消息 3'), 600)
  }

  const clearAll = () => {
    Message.clear()
  }

  const showMessageWithCallback = () => {
    Message.success({
      content: '操作成功！',
      onClose: () => {
        console.log('消息已关闭')
      }
    })
  }

  const showCustomClass = () => {
    Message.info({
      content: '自定义样式的消息',
      className: 'shadow-2xl'
    })
  }

  const showCustomIcon = () => {
    Message.info({
      content: '自定义图标的消息',
      icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z'
    })
  }

  return (
    <div className="max-w-5xl mx-auto p-8 text-gray-900 dark:text-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Message 消息提示</h1>
        <p className="text-gray-600 dark:text-gray-300">
          全局展示操作反馈信息，支持多种状态、自动关闭、队列管理等功能。
        </p>
      </div>

      {/* 基本用法 */}
      <DemoBlock
        title="基本用法"
        description="最简单的用法，调用 Message 方法即可显示消息提示。"
        code={basicSnippet}>
        <div className={demoCardClassName}>
          <div className="flex flex-wrap gap-2">
            <Button className={primaryButtonClassName} onClick={showInfo}>
              信息
            </Button>
            <Button className={successButtonClassName} onClick={showSuccess}>
              成功
            </Button>
            <Button className={warningButtonClassName} onClick={showWarning}>
              警告
            </Button>
            <Button className={dangerButtonClassName} onClick={showError}>
              错误
            </Button>
            <Button className={neutralButtonClassName} onClick={showLoading}>
              加载
            </Button>
          </div>
        </div>
      </DemoBlock>

      {/* 自定义持续时间 */}
      <DemoBlock
        title="自定义持续时间"
        description="通过 duration 属性自定义消息显示时间，设置为 0 时不会自动关闭。"
        code={durationSnippet}>
        <div className={demoCardClassName}>
          <div className="flex flex-wrap gap-2">
            <Button className={primaryButtonClassName} onClick={showShortMessage}>
              短时间（1秒）
            </Button>
            <Button className={successButtonClassName} onClick={showLongMessage}>
              长时间（5秒）
            </Button>
            <Button className={warningButtonClassName} onClick={showPersistentMessage}>
              不自动关闭
            </Button>
          </div>
        </div>
      </DemoBlock>

      {/* 手动关闭 */}
      <DemoBlock
        title="手动关闭"
        description="设置 closable 为 true 显示关闭按钮，或使用返回的关闭函数。此示例支持同时打开多条 loading，并提供逐条/一键关闭。"
        code={manualSnippet}>
        <div className={demoCardClassName}>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button className={primaryButtonClassName} onClick={showClosableMessage}>
              显示可关闭消息
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Button className={primaryButtonClassName} onClick={showMessage}>
              显示加载消息
            </Button>
            <Button
              className={dangerButtonClassName}
              onClick={closeManually}
              disabled={manualLoadingCount === 0}>
              关闭最后一个
            </Button>
            <Button
              className={dangerButtonClassName}
              onClick={closeAllManual}
              disabled={manualLoadingCount === 0}>
              关闭全部
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              当前可手动关闭：{manualLoadingCount} 条
            </span>
          </div>
        </div>
      </DemoBlock>

      {/* 完整流程示例 */}
      <DemoBlock title="完整流程示例" description="模拟表单提交的完整流程。" code={flowSnippet}>
        <div className={demoCardClassName}>
          <Button
            className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
            onClick={simulateRequest}>
            提交表单（模拟请求）
          </Button>
        </div>
      </DemoBlock>

      {/* 队列管理 */}
      <DemoBlock
        title="队列管理"
        description="支持多条消息同时显示，可以一次清空所有消息。"
        code={queueSnippet}>
        <div className={demoCardClassName}>
          <div className="flex flex-wrap gap-2">
            <Button className={primaryButtonClassName} onClick={showMultipleMessages}>
              显示多条消息
            </Button>
            <Button className={dangerButtonClassName} onClick={clearAll}>
              清空所有消息
            </Button>
          </div>
        </div>
      </DemoBlock>

      {/* 回调函数 */}
      <DemoBlock
        title="回调函数"
        description="可以通过 onClose 回调函数在消息关闭时执行特定操作（查看控制台）。"
        code={callbackSnippet}>
        <div className={demoCardClassName}>
          <Button className={successButtonClassName} onClick={showMessageWithCallback}>
            显示消息（带回调）
          </Button>
        </div>
      </DemoBlock>

      {/* 自定义样式 */}
      <DemoBlock
        title="自定义样式"
        description="可以通过 className 属性添加自定义样式类。"
        code={customSnippet}>
        <div className={demoCardClassName}>
          <Button className={purpleButtonClassName} onClick={showCustomClass}>
            自定义样式
          </Button>
        </div>
      </DemoBlock>

      {/* 自定义图标 */}
      <DemoBlock
        title="自定义图标"
        description="通过 icon 属性传入 SVG path d 属性值，替换默认类型图标。"
        code={customIconSnippet}>
        <div className={demoCardClassName}>
          <Button className={primaryButtonClassName} onClick={showCustomIcon}>
            自定义图标
          </Button>
        </div>
      </DemoBlock>

      {/* 实际应用场景 */}
      <DemoBlock title="实际应用场景" description="常见的使用场景示例。" code={sceneSnippet}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={demoCardClassName}>
            <h3 className="text-lg font-semibold mb-3">文件上传</h3>
            <Button
              className={primaryButtonClassName}
              onClick={() => {
                const close = Message.loading('正在上传文件...')
                setTimeout(() => {
                  close()
                  Message.success('文件上传成功')
                }, 2000)
              }}>
              上传文件
            </Button>
          </div>

          <div className={demoCardClassName}>
            <h3 className="text-lg font-semibold mb-3">保存设置</h3>
            <Button
              className={successButtonClassName}
              onClick={() => {
                const close = Message.loading('正在保存设置...')
                setTimeout(() => {
                  close()
                  Message.success({
                    content: '设置保存成功',
                    duration: 2000
                  })
                }, 1000)
              }}>
              保存设置
            </Button>
          </div>

          <div className={demoCardClassName}>
            <h3 className="text-lg font-semibold mb-3">删除确认</h3>
            <Button
              className={dangerButtonClassName}
              onClick={() => {
                Message.warning({
                  content: '确定要删除这条记录吗？',
                  duration: 5000,
                  closable: true
                })
              }}>
              删除记录
            </Button>
          </div>

          <div className={demoCardClassName}>
            <h3 className="text-lg font-semibold mb-3">网络错误</h3>
            <Button
              className={warningButtonClassName}
              onClick={() => {
                Message.error({
                  content: '网络连接失败，请检查您的网络设置',
                  duration: 0,
                  closable: true
                })
              }}>
              模拟网络错误
            </Button>
          </div>
        </div>
      </DemoBlock>

      <div className="mt-12 p-6 rounded-xl border bg-[color:color-mix(in_srgb,var(--tiger-primary,#2563eb)_12%,transparent)] border-[color:color-mix(in_srgb,var(--tiger-primary,#2563eb)_30%,transparent)] text-[var(--tiger-primary,#2563eb)]">
        <h3 className="text-lg font-semibold mb-2">提示</h3>
        <List
          className="text-[var(--tiger-primary,#2563eb)]"
          bordered="none"
          split={false}
          size="sm"
          dataSource={tips.map((title, index) => ({ key: index, title }))}
          renderItem={(item) => (
            <div className="flex items-start gap-2">
              <span aria-hidden>•</span>
              <span>{item.title}</span>
            </div>
          )}
        />
      </div>
    </div>
  )
}
