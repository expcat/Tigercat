import { Image } from '@expcat/tigercat-react/Image'

const photo = 'https://picsum.photos/seed/tiger-basic/600/400'

export default function App() {
  return <Image src={photo} alt="山间风景" width={240} height={150} fit="cover" preview={false} />
}
