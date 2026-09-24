export interface W9FormLabels {
  selectAll: string
  maxCountReached: string
  collapsedTags: string
  tagDuplicate: string
  tagMax: string
  tagRejected: string
  errorSummary: string
  sliderValue: string
  cronSentence: string
  cronNext: string
  keyboardClose: string
  eyedropper: string
  recentColors: string
  colorHex: string
  colorRgb: string
  colorHsl: string
  signatureHasStrokes: string
  signatureRedo: string
  uploadDirectory: string
  transferPage: string
}

const zhCN: W9FormLabels = {
  selectAll: '全选当前结果',
  maxCountReached: '最多选择 {count} 项',
  collapsedTags: '还有 {names}',
  tagDuplicate: '{tag} 已存在',
  tagMax: '{tag} 超出数量上限',
  tagRejected: '{tag} 未添加',
  errorSummary: '请修正以下错误',
  sliderValue: '当前值 {value}',
  cronSentence: '{sentence}',
  cronNext: '下一次 {time}',
  keyboardClose: '关闭',
  eyedropper: '吸管',
  recentColors: '最近使用',
  colorHex: '十六进制',
  colorRgb: 'RGB',
  colorHsl: 'HSL',
  signatureHasStrokes: '已有笔画',
  signatureRedo: '重做',
  uploadDirectory: '选择文件夹',
  transferPage: '第 {page} 页'
}

const enUS: W9FormLabels = {
  selectAll: 'Select filtered',
  maxCountReached: 'Select at most {count}',
  collapsedTags: 'Also {names}',
  tagDuplicate: '{tag} is already added',
  tagMax: '{tag} exceeds the limit',
  tagRejected: '{tag} was not added',
  errorSummary: 'Fix the following errors',
  sliderValue: 'Value {value}',
  cronSentence: '{sentence}',
  cronNext: 'Next {time}',
  keyboardClose: 'Close',
  eyedropper: 'Eyedropper',
  recentColors: 'Recent',
  colorHex: 'Hex',
  colorRgb: 'RGB',
  colorHsl: 'HSL',
  signatureHasStrokes: 'Has strokes',
  signatureRedo: 'Redo',
  uploadDirectory: 'Choose folder',
  transferPage: 'Page {page}'
}

export function getW9FormLabels(locale?: string): W9FormLabels {
  if (locale?.toLowerCase().startsWith('zh')) return zhCN
  return enUS
}
