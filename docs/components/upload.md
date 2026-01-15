# Upload 文件上传

支持文件上传、拖拽上传、多文件上传、文件类型和大小限制的组件。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Upload } from '@expcat/tigercat-vue'

const fileList = ref([])

const handleChange = (file, list) => {
  console.log('File changed:', file, list)
}
</script>

<template>
  <Upload v-model:file-list="fileList" @change="handleChange"> Select File </Upload>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Upload, type UploadFile } from '@expcat/tigercat-react'

function App() {
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const handleChange = (file, list) => {
    console.log('File changed:', file, list)
    setFileList(list)
  }

  return (
    <Upload fileList={fileList} onChange={handleChange}>
      Select File
    </Upload>
  )
}
```

## 拖拽上传 (Drag and Drop)

通过设置 `drag` 属性启用拖拽上传功能。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Upload } from '@expcat/tigercat-vue'

const fileList = ref([])
</script>

<template>
  <Upload v-model:file-list="fileList" drag />
</template>
```

### React

```tsx
import { Upload } from '@expcat/tigercat-react'

function App() {
  return <Upload drag />
}
```

## 国际化与自定义文案

Upload 内部提示文案（如拖拽区“Click to upload / or drag and drop”、`Accepted`、`Max size` 等）支持：

- 随 `locale` 切换（通过传入不同的 `locale` 对象）
- 通过 `labels` 覆盖默认文案（优先级高于 `locale`）

如果你希望“全局语言切换一次，所有组件默认生效”，可以使用 `ConfigProvider` 提供全局 `locale`，组件仍可用自身的 `locale/labels` 进一步覆盖。

其中部分文案支持模板占位符：

- `acceptInfoText`：支持 `{accept}`
- `maxSizeInfoText`：支持 `{maxSize}`（内部会先格式化为如 `5.00 MB`）
- `removeFileAriaLabel` / `previewFileAriaLabel`：支持 `{fileName}`

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Upload, ConfigProvider } from '@expcat/tigercat-vue'

const fileList = ref([])

const zhCN = {
  upload: {
    clickToUploadText: '点击上传',
    dragAndDropText: '或拖拽到此处',
    acceptInfoText: '支持：{accept}',
    maxSizeInfoText: '大小限制：{maxSize}',
    selectFileText: '选择文件'
  }
}
</script>

<template>
  <ConfigProvider :locale="zhCN">
    <Upload
      v-model:file-list="fileList"
      drag
      accept="image/*"
      :max-size="2 * 1024 * 1024"
      :labels="{ acceptInfoText: '仅允许：{accept}' }" />
  </ConfigProvider>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Upload, ConfigProvider, type UploadFile } from '@expcat/tigercat-react'

const zhCN = {
  upload: {
    clickToUploadText: '点击上传',
    dragAndDropText: '或拖拽到此处',
    acceptInfoText: '支持：{accept}',
    maxSizeInfoText: '大小限制：{maxSize}',
    selectFileText: '选择文件'
  }
}

export function App() {
  const [fileList, setFileList] = useState<UploadFile[]>([])

  return (
    <ConfigProvider locale={zhCN}>
      <Upload
        drag
        accept="image/*"
        maxSize={2 * 1024 * 1024}
        fileList={fileList}
        onChange={(_f, list) => setFileList(list)}
        labels={{ acceptInfoText: '仅允许：{accept}' }}
      />
    </ConfigProvider>
  )
}
```

## 多文件上传 (Multiple Files)

通过设置 `multiple` 属性允许选择多个文件。

### Vue 3

```vue
<template>
  <Upload v-model:file-list="fileList" multiple> Select Multiple Files </Upload>
</template>
```

### React

```tsx
<Upload fileList={fileList} multiple>
  Select Multiple Files
</Upload>
```

## 文件类型限制 (File Type Validation)

通过 `accept` 属性限制允许上传的文件类型。

### Vue 3

```vue
<template>
  <div class="space-y-4">
    <!-- 只允许图片 -->
    <Upload accept="image/*"> Upload Image </Upload>

    <!-- 只允许特定格式 -->
    <Upload accept=".jpg,.png,.pdf"> Upload JPG, PNG or PDF </Upload>
  </div>
</template>
```

### React

```tsx
<div className="space-y-4">
  {/* 只允许图片 */}
  <Upload accept="image/*">Upload Image</Upload>

  {/* 只允许特定格式 */}
  <Upload accept=".jpg,.png,.pdf">Upload JPG, PNG or PDF</Upload>
</div>
```

## 文件大小限制 (File Size Limit)

通过 `maxSize` 属性限制文件大小（单位：字节）。

### Vue 3

```vue
<template>
  <!-- 限制为 5MB -->
  <Upload :max-size="5 * 1024 * 1024"> Upload (Max 5MB) </Upload>
</template>
```

### React

```tsx
{
  /* 限制为 5MB */
}
;<Upload maxSize={5 * 1024 * 1024}>Upload (Max 5MB)</Upload>
```

## 文件数量限制 (File Limit)

通过 `limit` 属性限制上传文件的数量。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Upload } from '@expcat/tigercat-vue'

const fileList = ref([])

const handleExceed = (files, list) => {
  console.log('Files exceeded limit:', files)
}
</script>

<template>
  <Upload v-model:file-list="fileList" multiple :limit="3" @exceed="handleExceed">
    Upload (Max 3 files)
  </Upload>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Upload, type UploadFile } from '@expcat/tigercat-react'

function App() {
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const handleExceed = (files, list) => {
    console.log('Files exceeded limit:', files)
  }

  return (
    <Upload fileList={fileList} multiple limit={3} onExceed={handleExceed}>
      Upload (Max 3 files)
    </Upload>
  )
}
```

## 列表展示类型 (List Type)

支持三种列表展示类型：`text`（默认）、`picture`、`picture-card`。

### Vue 3

```vue
<template>
  <div class="space-y-4">
    <!-- 文本列表 -->
    <Upload list-type="text"> Text List </Upload>

    <!-- 图片列表 -->
    <Upload list-type="picture" accept="image/*"> Picture List </Upload>

    <!-- 图片卡片 -->
    <Upload list-type="picture-card" accept="image/*"> Picture Card </Upload>
  </div>
</template>
```

### React

```tsx
<div className="space-y-4">
  {/* 文本列表 */}
  <Upload listType="text">Text List</Upload>

  {/* 图片列表 */}
  <Upload listType="picture" accept="image/*">
    Picture List
  </Upload>

  {/* 图片卡片 */}
  <Upload listType="picture-card" accept="image/*">
    Picture Card
  </Upload>
</div>
```

## 自定义上传 (Custom Upload)

通过 `customRequest` 自定义上传行为。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Upload } from '@expcat/tigercat-vue'

const fileList = ref([])

const customRequest = ({ file, onProgress, onSuccess, onError }) => {
  // 模拟上传进度
  let progress = 0
  const interval = setInterval(() => {
    progress += 10
    onProgress(progress)

    if (progress >= 100) {
      clearInterval(interval)
      onSuccess({ url: 'https://example.com/file.jpg' })
    }
  }, 200)
}
</script>

<template>
  <Upload v-model:file-list="fileList" :custom-request="customRequest"> Custom Upload </Upload>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Upload, type UploadFile, type UploadRequestOptions } from '@expcat/tigercat-react'

function App() {
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const customRequest = ({ file, onProgress, onSuccess, onError }: UploadRequestOptions) => {
    // 模拟上传进度
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      if (onProgress) onProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        if (onSuccess) onSuccess({ url: 'https://example.com/file.jpg' })
      }
    }, 200)
  }

  return (
    <Upload fileList={fileList} customRequest={customRequest}>
      Custom Upload
    </Upload>
  )
}
```

## 上传前校验 (Before Upload)

通过 `beforeUpload` 在上传前进行校验，返回 `false` 可阻止上传。

如果 `beforeUpload` 抛错或 Promise reject，会被视为校验失败并阻止本次文件进入列表（不会触发 `change/onChange`）。

### Vue 3

```vue
<script setup>
import { Upload } from '@expcat/tigercat-vue'

const beforeUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    alert('只能上传 JPG 格式的图片！')
    return false
  }
  if (!isLt2M) {
    alert('图片大小不能超过 2MB！')
    return false
  }
  return true
}
</script>

<template>
  <Upload :before-upload="beforeUpload"> Upload JPG (&lt; 2MB) </Upload>
</template>
```

### React

```tsx
import { Upload } from '@expcat/tigercat-react'

function App() {
  const beforeUpload = (file: File) => {
    const isJPG = file.type === 'image/jpeg'
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isJPG) {
      alert('只能上传 JPG 格式的图片！')
      return false
    }
    if (!isLt2M) {
      alert('图片大小不能超过 2MB！')
      return false
    }
    return true
  }

  return <Upload beforeUpload={beforeUpload}>Upload JPG (&lt; 2MB)</Upload>
}
```

## 禁用状态 (Disabled)

### Vue 3

```vue
<template>
  <Upload disabled> Disabled Upload </Upload>
</template>
```

### React

```tsx
<Upload disabled>Disabled Upload</Upload>
```

## API

### Props

| 参数          | 说明                                                   | 类型                                                      | 默认值   |
| ------------- | ------------------------------------------------------ | --------------------------------------------------------- | -------- |
| accept        | 接受的文件类型（同 HTML input accept 属性）            | `string`                                                  | -        |
| multiple      | 是否允许多选文件                                       | `boolean`                                                 | `false`  |
| limit         | 最大允许上传个数                                       | `number`                                                  | -        |
| maxSize       | 文件大小限制（字节）                                   | `number`                                                  | -        |
| disabled      | 是否禁用                                               | `boolean`                                                 | `false`  |
| drag          | 是否启用拖拽上传                                       | `boolean`                                                 | `false`  |
| listType      | 文件列表的类型                                         | `'text' \| 'picture' \| 'picture-card'`                   | `'text'` |
| fileList      | 文件列表（Vue 可用 v-model:file-list；不传则内部维护） | `UploadFile[]`                                            | -        |
| showFileList  | 是否显示文件列表                                       | `boolean`                                                 | `true`   |
| autoUpload    | 选择文件后是否自动上传                                 | `boolean`                                                 | `true`   |
| customRequest | 自定义上传实现                                         | `(options: UploadRequestOptions) => void`                 | -        |
| beforeUpload  | 上传文件之前的钩子，返回 false 可阻止上传              | `(file: File) => boolean \| Promise<boolean>`             | -        |
| className     | 自定义 CSS 类名                                        | `string`                                                  | -        |
| style         | 自定义样式（Vue 为 prop；React 为原生 `style`）        | `Record<string, string \| number> \| React.CSSProperties` | -        |

### Events (Vue) / Callbacks (React)

| 事件名 / 回调         | 说明                                                           | 参数                                         |
| --------------------- | -------------------------------------------------------------- | -------------------------------------------- |
| change / onChange     | 文件状态改变时的回调                                           | `(file: UploadFile, fileList: UploadFile[])` |
| remove / onRemove     | 文件移除时的回调（返回 false 可阻止移除，仅 React `onRemove`） | `(file: UploadFile, fileList: UploadFile[])` |
| preview / onPreview   | 点击文件预览时的回调                                           | `(file: UploadFile)`                         |
| progress / onProgress | 上传进度回调                                                   | `(progress: number, file: UploadFile)`       |
| success / onSuccess   | 上传成功回调                                                   | `(response: unknown, file: UploadFile)`      |
| error / onError       | 上传失败回调                                                   | `(error: Error, file: UploadFile)`           |
| exceed / onExceed     | 文件超出个数限制时的回调                                       | `(files: File[], fileList: UploadFile[])`    |

### UploadFile 接口

```typescript
interface UploadFile {
  uid: string // 唯一标识符
  name: string // 文件名
  status?: 'ready' | 'uploading' | 'success' | 'error' // 状态
  progress?: number // 上传进度 (0-100)
  size?: number // 文件大小（字节）
  type?: string // 文件类型
  url?: string // 文件 URL
  file?: File // 原始 File 对象
  error?: string // 错误信息
}
```

### UploadRequestOptions 接口

```typescript
interface UploadRequestOptions {
  file: File // 要上传的文件
  onProgress?: (progress: number) => void // 进度回调
  onSuccess?: (response: unknown) => void // 成功回调
  onError?: (error: Error) => void // 错误回调
}
```

## 无障碍支持 (Accessibility)

Upload 组件遵循 WAI-ARIA 规范，提供完整的键盘和屏幕阅读器支持：

- 上传按钮和拖拽区域具有适当的 `role` 和 `aria-label` 属性
- 文件列表使用语义化的 `<ul>` 和 `<li>` 标签
- 移除和预览按钮具有描述性的 `aria-label`
- 支持键盘导航（Tab 键聚焦，Enter/Space 键触发）
- 文件状态图标具有 `aria-label` 提供状态信息

## 主题定制 (Theme Customization)

Upload 组件使用 Tailwind CSS 类和 CSS 变量，支持主题定制：

```css
:root {
  --tiger-primary: #2563eb; /* 主色调 */
  --tiger-primary-hover: #1d4ed8; /* 主色调悬停 */
}
```

## 注意事项

1. **文件上传实现**：默认情况下，组件不会实际上传文件到服务器。你需要使用 `customRequest` 属性提供自己的上传实现。

2. **文件验证**：`accept` 和 `maxSize` 只在客户端进行验证，服务器端也应该进行相应的验证。

3. **拖拽支持**：拖拽功能需要现代浏览器支持，不支持 IE。

4. **图片预览**：使用 `picture-card` 模式时，组件会使用 `URL.createObjectURL` 创建临时 URL 进行预览。记得在不需要时清理这些 URL。

5. **文件列表管理**：

- Vue：受控用 `v-model:file-list`；非受控可不传 `file-list`（组件内部维护）
- React：受控传 `fileList` + `onChange`；非受控不传 `fileList`（组件内部维护），可选监听 `onChange`
