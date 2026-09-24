/**
 * W9 Basic labels. Kept off TigerLocale so locale data files stay untouched.
 * Unknown locales fall back to en-US.
 */

export type BasicLabelGroup =
  | 'imagePreview'
  | 'avatarGroup'
  | 'qrcode'
  | 'code'
  | 'imageCropper'
  | 'imageCompare'
  | 'gallery'

const ZH: Record<BasicLabelGroup, Record<string, string>> = {
  imagePreview: {
    flipHorizontal: '水平翻转',
    download: '下载当前图片',
    resetScale: '原始尺寸'
  },
  avatarGroup: {
    overflowList: '折叠的成员'
  },
  qrcode: {
    scanned: '已扫描'
  },
  code: {
    wrap: '自动换行',
    nowrap: '不换行',
    language: '语言'
  },
  imageCropper: {
    aspect: '裁剪比例',
    free: '自由',
    square: '1:1',
    fourThree: '4:3',
    sixteenNine: '16:9',
    rotate: '旋转',
    flip: '翻转',
    circle: '圆形'
  },
  imageCompare: {
    before: '之前',
    after: '之后'
  },
  gallery: {
    list: '缩略图',
    count: '{current} / {total}',
    open: '打开预览'
  }
}

const EN: Record<BasicLabelGroup, Record<string, string>> = {
  imagePreview: {
    flipHorizontal: 'Flip horizontally',
    download: 'Download current image',
    resetScale: 'Original size'
  },
  avatarGroup: {
    overflowList: 'Collapsed people'
  },
  qrcode: {
    scanned: 'Scanned'
  },
  code: {
    wrap: 'Wrap lines',
    nowrap: 'No wrap',
    language: 'Language'
  },
  imageCropper: {
    aspect: 'Crop ratio',
    free: 'Free',
    square: '1:1',
    fourThree: '4:3',
    sixteenNine: '16:9',
    rotate: 'Rotate',
    flip: 'Flip',
    circle: 'Circle'
  },
  imageCompare: {
    before: 'Before',
    after: 'After'
  },
  gallery: {
    list: 'Thumbnails',
    count: '{current} / {total}',
    open: 'Open preview'
  }
}

export function basicLabel(
  localeId: string | undefined,
  group: BasicLabelGroup,
  key: string
): string {
  const pack = localeId === 'zh-CN' ? ZH : EN
  const value = pack[group][key]
  if (value) return value
  return EN[group][key] ?? key
}
