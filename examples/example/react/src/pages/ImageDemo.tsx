import { useState } from 'react'
import { Image, ImageGroup, ImagePreview } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const PHOTOS = [
  'https://picsum.photos/seed/tiger1/600/400',
  'https://picsum.photos/seed/tiger2/600/400',
  'https://picsum.photos/seed/tiger3/600/400',
  'https://picsum.photos/seed/tiger4/600/400',
  'https://picsum.photos/seed/tiger5/600/400',
  'https://picsum.photos/seed/tiger6/600/400'
]

const basicSnippet = `<div className="flex gap-4 flex-wrap">
  <Image src="${PHOTOS[0]}" alt="示例图片" width={200} height={150} />
  <Image src="${PHOTOS[1]}" alt="示例图片 2" width={200} height={150} />
</div>`

const fitSnippet = `<div className="flex gap-4 flex-wrap">
  {['contain', 'cover', 'fill', 'none', 'scale-down'].map(mode => (
    <div key={mode} className="text-center">
      <Image src={src} alt={mode} width={120} height={120} fit={mode}
        className="border border-gray-200 rounded" />
      <p className="text-xs text-gray-500 mt-1">{mode}</p>
    </div>
  ))}
</div>`

const fallbackSnippet = `<div className="flex gap-4 items-start">
  {/* fallbackSrc 回退 */}
  <div className="text-center">
    <Image src="/broken.jpg" fallbackSrc="${PHOTOS[0]}" width={150} height={100} alt="回退示例" />
    <p className="text-xs text-gray-500 mt-1">fallbackSrc 回退</p>
  </div>
  {/* 自定义错误渲染 */}
  <div className="text-center">
    <Image src="/broken.jpg" width={150} height={100} alt="错误"
      errorRender={<div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm">加载失败</div>} />
    <p className="text-xs text-gray-500 mt-1">errorRender</p>
  </div>
</div>`

const lazySnippet = `<Image src="${PHOTOS[2]}" width={200} height={150} lazy alt="懒加载"
  placeholderRender={
    <div className="... animate-pulse">加载中…</div>
  }
/>`

const previewSnippet = `{/* 点击预览（默认开启） */}
<div className="flex gap-4 flex-wrap">
  {photos.map((src, i) => (
    <Image key={i} src={src} width={120} height={80} alt="预览" />
  ))}
</div>`

const groupSnippet = `{/* ImageGroup：多图关联预览 */}
<ImageGroup>
  <div className="flex gap-4 flex-wrap">
    {photos.map((src, i) => (
      <Image key={i} src={src} width={120} height={80} alt="组图" />
    ))}
  </div>
</ImageGroup>`

const standalonePreviewSnippet = `const [visible, setVisible] = useState(false)

<button onClick={() => setVisible(true)}>打开预览</button>
<ImagePreview visible={visible} images={photos} currentIndex={0}
  onVisibleChange={setVisible} />`

const noPreviewSnippet = `{/* 关闭预览 */}
<Image src="${PHOTOS[0]}" width={200} height={150} preview={false} alt="无预览" />`

const FIT_MODES = ['contain', 'cover', 'fill', 'none', 'scale-down'] as const

export default function ImageDemo() {
  const [previewVisible, setPreviewVisible] = useState(false)

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Image 图片</h1>
      <p className="text-gray-600 mb-8">
        图片展示组件，支持适配模式、懒加载、错误回退、点击预览、多图组预览。
      </p>

      <DemoBlock title="基本用法" description="使用 src 和尺寸属性展示图片" code={basicSnippet}>
        <div className="flex gap-4 flex-wrap">
          <Image src={PHOTOS[0]} alt="示例图片" width={200} height={150} preview={false} />
          <Image src={PHOTOS[1]} alt="示例图片 2" width={200} height={150} preview={false} />
        </div>
      </DemoBlock>

      <DemoBlock
        title="适配模式"
        description="fit 属性控制图片在容器中的适配方式"
        code={fitSnippet}>
        <div className="flex gap-4 flex-wrap">
          {FIT_MODES.map((mode) => (
            <div key={mode} className="text-center">
              <Image
                src={PHOTOS[0]}
                alt={mode}
                width={120}
                height={120}
                fit={mode}
                preview={false}
                className="border border-gray-200 rounded"
              />
              <p className="text-xs text-gray-500 mt-1">{mode}</p>
            </div>
          ))}
        </div>
      </DemoBlock>

      <DemoBlock
        title="加载失败回退"
        description="设置 fallbackSrc 或使用 errorRender 自定义错误状态"
        code={fallbackSnippet}>
        <div className="flex gap-4 items-start">
          <div className="text-center">
            <Image
              src="/broken.jpg"
              fallbackSrc={PHOTOS[0]}
              width={150}
              height={100}
              alt="回退示例"
              preview={false}
            />
            <p className="text-xs text-gray-500 mt-1">fallbackSrc 回退</p>
          </div>
          <div className="text-center">
            <Image
              src="/broken.jpg"
              width={150}
              height={100}
              alt="错误"
              preview={false}
              errorRender={
                <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm rounded">
                  加载失败
                </div>
              }
            />
            <p className="text-xs text-gray-500 mt-1">errorRender</p>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock
        title="懒加载"
        description="lazy 属性开启 IntersectionObserver 懒加载"
        code={lazySnippet}>
        <div className="flex gap-4">
          <Image
            src={PHOTOS[2]}
            width={200}
            height={150}
            lazy
            alt="懒加载"
            preview={false}
            placeholderRender={
              <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm animate-pulse rounded">
                加载中…
              </div>
            }
          />
        </div>
      </DemoBlock>

      <DemoBlock
        title="点击预览"
        description="默认开启，点击图片进入全屏预览"
        code={previewSnippet}>
        <div className="flex gap-4 flex-wrap">
          {PHOTOS.slice(0, 4).map((src, i) => (
            <Image key={i} src={src} width={120} height={80} alt="预览" />
          ))}
        </div>
      </DemoBlock>

      <DemoBlock
        title="关闭预览"
        description="设置 preview={false} 禁用点击预览"
        code={noPreviewSnippet}>
        <Image src={PHOTOS[0]} width={200} height={150} preview={false} alt="无预览" />
      </DemoBlock>

      <DemoBlock
        title="图片组 ImageGroup"
        description="用 ImageGroup 包裹多张 Image，点击任一图片进入多图预览"
        code={groupSnippet}>
        <ImageGroup>
          <div className="flex gap-4 flex-wrap">
            {PHOTOS.map((src, i) => (
              <Image key={i} src={src} width={120} height={80} alt="组图" />
            ))}
          </div>
        </ImageGroup>
      </DemoBlock>

      <DemoBlock
        title="独立 ImagePreview"
        description="直接使用 ImagePreview 组件，可编程控制预览"
        code={standalonePreviewSnippet}>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => setPreviewVisible(true)}>
          打开预览
        </button>
        <ImagePreview
          visible={previewVisible}
          images={PHOTOS}
          currentIndex={0}
          onVisibleChange={setPreviewVisible}
        />
      </DemoBlock>
    </div>
  )
}
