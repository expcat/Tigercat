import { Image } from '@expcat/tigercat-react/Image'

const fallbackPhoto =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="150"><rect width="100%" height="100%" fill="#d1fae5"/><text x="50%" y="54%" text-anchor="middle" fill="#065f46" font-size="16">fallback</text></svg>'
  )

export default function App() {
  return (
    <div className="flex flex-wrap gap-4">
      <Image
        src="/missing-photo.jpg"
        fallbackSrc={fallbackPhoto}
        alt="回退到本地图形"
        width={240}
        height={150}
        preview={false}
      />
      <Image
        src="/missing-photo.jpg"
        fallbackSrc="/also-missing.jpg"
        alt="二次失败"
        width={240}
        height={150}
        preview={false}
        errorRender={
          <div className="flex h-full w-full items-center justify-center text-sm text-[var(--tiger-text-secondary)]">
            无法加载
          </div>
        }
      />
      <Image
        src={fallbackPhoto}
        alt="懒加载占位"
        width={240}
        height={150}
        lazy
        preview={false}
        placeholderRender={
          <div className="flex h-full w-full items-center justify-center text-sm text-[var(--tiger-text-secondary)]">
            加载中
          </div>
        }
      />
    </div>
  )
}
