import { Image } from '@expcat/tigercat-react/Image'

export default function App() {
  return (
    <Image
      src="https://picsum.photos/seed/tiger-preview/600/400"
      alt="悬停查看大图"
      width={240}
      height={150}
      previewTrigger="hover"
    />
  )
}
