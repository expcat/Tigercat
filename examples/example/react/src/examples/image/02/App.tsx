import { Image } from '@expcat/tigercat-react/Image'

const fallbackPhoto = 'https://picsum.photos/seed/tiger-fallback/600/400'

export default function App() {
  return (
    <Image
      src="/missing-photo.jpg"
      fallbackSrc={fallbackPhoto}
      alt="加载失败时显示的回退图片"
      width={240}
      height={150}
      preview={false}
    />
  )
}
