import { Image } from '@expcat/tigercat-react/Image'
import { ImageGroup } from '@expcat/tigercat-react/ImageGroup'

const photos = [
  'https://picsum.photos/seed/tiger-group-1/600/400',
  'https://picsum.photos/seed/tiger-group-2/600/400',
  'https://picsum.photos/seed/tiger-group-3/600/400'
]

export default function App() {
  return (
    <ImageGroup>
      <div className="flex flex-wrap gap-3">
        {photos.map((src, index) => (
          <Image key={src} src={src} alt={`组图 ${index + 1}`} width={120} height={80} />
        ))}
      </div>
    </ImageGroup>
  )
}
