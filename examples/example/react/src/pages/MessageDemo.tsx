import { useRef, useState } from 'react';
import { message, Divider, Button, List } from '@tigercat/react';

export default function MessageDemo() {
  const manualLoadingCloseFnsRef = useRef<Array<() => void>>([]);
  const [manualLoadingCount, setManualLoadingCount] = useState(0);

  const tips = [
    '消息默认会在 3 秒后自动关闭',
    'loading 类型的消息不会自动关闭，需要手动关闭',
    '多条消息会依次排列显示，形成队列',
    '可以通过 message.clear() 清空所有正在显示的消息',
    'Message 与 Alert 的区别：Message 是全局提示，Alert 是页面内嵌提示',
  ];

  const demoCardClassName =
    'p-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40';

  const buttonBaseClassName =
    'px-4 py-2 rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950';

  const primaryButtonClassName = `${buttonBaseClassName} bg-blue-600 hover:bg-blue-700 focus:ring-blue-400`;
  const successButtonClassName = `${buttonBaseClassName} bg-green-600 hover:bg-green-700 focus:ring-green-400`;
  const warningButtonClassName = `${buttonBaseClassName} bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-400`;
  const dangerButtonClassName = `${buttonBaseClassName} bg-red-600 hover:bg-red-700 focus:ring-red-400`;
  const neutralButtonClassName = `${buttonBaseClassName} bg-gray-600 hover:bg-gray-700 focus:ring-gray-400`;
  const purpleButtonClassName = `${buttonBaseClassName} bg-purple-600 hover:bg-purple-700 focus:ring-purple-400`;

  const showInfo = () => {
    message.info('这是一条信息提示');
  };

  const showSuccess = () => {
    message.success('操作成功！');
  };

  const showWarning = () => {
    message.warning('请注意相关事项');
  };

  const showError = () => {
    message.error('操作失败，请重试');
  };

  const showLoading = () => {
    const close = message.loading('加载中...');
    setTimeout(close, 3000);
  };

  const showShortMessage = () => {
    message.info({
      content: '这条消息1秒后关闭',
      duration: 1000,
    });
  };

  const showLongMessage = () => {
    message.success({
      content: '这条消息5秒后关闭',
      duration: 5000,
    });
  };

  const showPersistentMessage = () => {
    message.warning({
      content: '这条消息需要手动关闭',
      duration: 0,
      closable: true,
    });
  };

  const showClosableMessage = () => {
    message.info({
      content: '这条消息可以手动关闭',
      closable: true,
      duration: 0,
    });
  };

  const showMessage = () => {
    const nextIndex = manualLoadingCloseFnsRef.current.length + 1;
    const close = message.loading(`正在处理请求...（${nextIndex}）`);
    manualLoadingCloseFnsRef.current.push(close);
    setManualLoadingCount(manualLoadingCloseFnsRef.current.length);
  };

  const closeManually = () => {
    const close = manualLoadingCloseFnsRef.current.pop();
    if (close) {
      close();
      setManualLoadingCount(manualLoadingCloseFnsRef.current.length);
    }
  };

  const closeAllManual = () => {
    const closers = manualLoadingCloseFnsRef.current;
    manualLoadingCloseFnsRef.current = [];
    for (const close of closers) {
      close();
    }
    setManualLoadingCount(0);
  };

  const simulateRequest = async () => {
    const close = message.loading('正在提交表单...');

    // 模拟异步请求
    await new Promise((resolve) => setTimeout(resolve, 2000));

    close();
    message.success({
      content: '表单提交成功！',
      duration: 3000,
      onClose: () => {
        console.log('成功消息已关闭');
      },
    });
  };

  const showMultipleMessages = () => {
    message.info('消息 1');
    setTimeout(() => message.success('消息 2'), 300);
    setTimeout(() => message.warning('消息 3'), 600);
  };

  const clearAll = () => {
    message.clear();
  };

  const showMessageWithCallback = () => {
    message.success({
      content: '操作成功！',
      onClose: () => {
        console.log('消息已关闭');
      },
    });
  };

  const showCustomClass = () => {
    message.info({
      content: '自定义样式的消息',
      className: 'shadow-2xl',
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-8 text-gray-900 dark:text-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Message 消息提示</h1>
        <p className="text-gray-600 dark:text-gray-300">
          全局展示操作反馈信息，支持多种状态、自动关闭、队列管理等功能。
        </p>
      </div>

      {/* 基本用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基本用法</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          最简单的用法，调用 message 方法即可显示消息提示。
        </p>
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
        <Divider className="my-6" />
      </section>

      {/* 自定义持续时间 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">自定义持续时间</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          通过 duration 属性自定义消息显示时间，设置为 0 时不会自动关闭。
        </p>
        <div className={demoCardClassName}>
          <div className="flex flex-wrap gap-2">
            <Button
              className={primaryButtonClassName}
              onClick={showShortMessage}>
              短时间（1秒）
            </Button>
            <Button
              className={successButtonClassName}
              onClick={showLongMessage}>
              长时间（5秒）
            </Button>
            <Button
              className={warningButtonClassName}
              onClick={showPersistentMessage}>
              不自动关闭
            </Button>
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 手动关闭 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">手动关闭</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          设置 closable 为 true
          显示关闭按钮，或使用返回的关闭函数。此示例支持同时打开多条
          loading，并提供逐条/一键关闭。
        </p>
        <div className={demoCardClassName}>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              className={primaryButtonClassName}
              onClick={showClosableMessage}>
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
        <Divider className="my-6" />
      </section>

      {/* 完整流程示例 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">完整流程示例</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          模拟表单提交的完整流程。
        </p>
        <div className={demoCardClassName}>
          <Button
            className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
            onClick={simulateRequest}>
            提交表单（模拟请求）
          </Button>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 队列管理 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">队列管理</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          支持多条消息同时显示，可以一次清空所有消息。
        </p>
        <div className={demoCardClassName}>
          <div className="flex flex-wrap gap-2">
            <Button
              className={primaryButtonClassName}
              onClick={showMultipleMessages}>
              显示多条消息
            </Button>
            <Button className={dangerButtonClassName} onClick={clearAll}>
              清空所有消息
            </Button>
          </div>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 回调函数 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">回调函数</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          可以通过 onClose 回调函数在消息关闭时执行特定操作（查看控制台）。
        </p>
        <div className={demoCardClassName}>
          <Button
            className={successButtonClassName}
            onClick={showMessageWithCallback}>
            显示消息（带回调）
          </Button>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 自定义样式 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">自定义样式</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          可以通过 className 属性添加自定义样式类。
        </p>
        <div className={demoCardClassName}>
          <Button className={purpleButtonClassName} onClick={showCustomClass}>
            自定义样式
          </Button>
        </div>
        <Divider className="my-6" />
      </section>

      {/* 实际应用场景 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">实际应用场景</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          常见的使用场景示例。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={demoCardClassName}>
            <h3 className="text-lg font-semibold mb-3">文件上传</h3>
            <Button
              className={primaryButtonClassName}
              onClick={() => {
                const close = message.loading('正在上传文件...');
                setTimeout(() => {
                  close();
                  message.success('文件上传成功');
                }, 2000);
              }}>
              上传文件
            </Button>
          </div>

          <div className={demoCardClassName}>
            <h3 className="text-lg font-semibold mb-3">保存设置</h3>
            <Button
              className={successButtonClassName}
              onClick={() => {
                const close = message.loading('正在保存设置...');
                setTimeout(() => {
                  close();
                  message.success({
                    content: '设置保存成功',
                    duration: 2000,
                  });
                }, 1000);
              }}>
              保存设置
            </Button>
          </div>

          <div className={demoCardClassName}>
            <h3 className="text-lg font-semibold mb-3">删除确认</h3>
            <Button
              className={dangerButtonClassName}
              onClick={() => {
                message.warning({
                  content: '确定要删除这条记录吗？',
                  duration: 5000,
                  closable: true,
                });
              }}>
              删除记录
            </Button>
          </div>

          <div className={demoCardClassName}>
            <h3 className="text-lg font-semibold mb-3">网络错误</h3>
            <Button
              className={warningButtonClassName}
              onClick={() => {
                message.error({
                  content: '网络连接失败，请检查您的网络设置',
                  duration: 0,
                  closable: true,
                });
              }}>
              模拟网络错误
            </Button>
          </div>
        </div>
      </section>

      <div className="mt-12 p-6 rounded-xl border bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-200">
        <h3 className="text-lg font-semibold mb-2">提示</h3>
        <List
          className="text-blue-700 dark:text-blue-200"
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
  );
}
