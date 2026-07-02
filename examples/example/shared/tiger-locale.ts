import type { TigerLocale } from '@expcat/tigercat-core'
import type { DemoLang } from './app-config'

export function getDemoTigerLocale(lang: DemoLang): Partial<TigerLocale> {
  if (lang === 'zh-CN') {
    return {
      locale: 'zh-CN',
      common: {
        okText: '确定',
        cancelText: '取消',
        closeText: '关闭',
        loadingText: '加载中...',
        emptyText: '暂无数据',
        noMoreText: '没有更多了',
        searchPlaceholder: '搜索...',
        clearText: '清除'
      },
      modal: {
        closeAriaLabel: '关闭对话框',
        okText: '确定',
        cancelText: '取消'
      },
      drawer: {
        closeAriaLabel: '关闭抽屉'
      },
      qrcode: {
        ariaLabel: '二维码',
        expiredText: '二维码已过期',
        refreshText: '刷新',
        loadingText: '加载中...'
      },
      formWizard: {
        prevText: '上一步',
        nextText: '下一步',
        finishText: '完成'
      },
      upload: {
        dragAreaAriaLabel: '上传文件：点击或拖拽',
        buttonAriaLabel: '上传文件',
        clickToUploadText: '点击上传',
        dragAndDropText: '或拖拽到此处',
        acceptInfoText: '支持：{accept}',
        maxSizeInfoText: '大小限制：{maxSize}',
        selectFileText: '选择文件',
        uploadedFilesAriaLabel: '已上传文件',
        successAriaLabel: '成功',
        errorAriaLabel: '失败',
        uploadingAriaLabel: '上传中',
        removeFileAriaLabel: '移除 {fileName}',
        previewFileAriaLabel: '预览 {fileName}'
      }
    }
  }

  return {
    locale: 'en-US',
    common: {
      okText: 'OK',
      cancelText: 'Cancel',
      closeText: 'Close',
      loadingText: 'Loading...',
      emptyText: 'No data',
      noMoreText: 'No more items',
      searchPlaceholder: 'Search...',
      clearText: 'Clear'
    },
    modal: {
      closeAriaLabel: 'Close dialog',
      okText: 'OK',
      cancelText: 'Cancel'
    },
    drawer: {
      closeAriaLabel: 'Close drawer'
    },
    qrcode: {
      ariaLabel: 'QR Code',
      expiredText: 'QR code expired',
      refreshText: 'Refresh',
      loadingText: 'Loading...'
    },
    formWizard: {
      prevText: 'Previous',
      nextText: 'Next',
      finishText: 'Finish'
    },
    upload: {
      dragAreaAriaLabel: 'Upload file by clicking or dragging',
      buttonAriaLabel: 'Upload file',
      clickToUploadText: 'Click to upload',
      dragAndDropText: 'or drag and drop',
      acceptInfoText: 'Accepted: {accept}',
      maxSizeInfoText: 'Max size: {maxSize}',
      selectFileText: 'Select File',
      uploadedFilesAriaLabel: 'Uploaded files',
      successAriaLabel: 'Success',
      errorAriaLabel: 'Error',
      uploadingAriaLabel: 'Uploading',
      removeFileAriaLabel: 'Remove {fileName}',
      previewFileAriaLabel: 'Preview {fileName}'
    }
  }
}
