import type { TigerLocale } from '@tigercat/core'
import type { DemoLang } from './app-config'

export function getDemoTigerLocale(lang: DemoLang): Partial<TigerLocale> {
  if (lang === 'zh-CN') {
    return {
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
