import { Image } from '@expcat/tigercat-react/Image'

export default function App() {
  return (
    <Image
      src="https://picsum.photos/seed/tiger-preview/600/400"
      alt="示例图片"
      width={240}
      height={150}
      preview
    />
  )
}
