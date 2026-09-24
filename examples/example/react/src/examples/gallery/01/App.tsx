import { Gallery } from '@expcat/tigercat-react/Gallery'

const items = [
  { src: 'https://picsum.photos/seed/gallery-1/640/400', alt: '林间' },
  { src: 'https://picsum.photos/seed/gallery-2/640/400', alt: '湖面' },
  { src: 'https://picsum.photos/seed/gallery-3/640/400', alt: '山脊' }
]

export default function App() {
  return <Gallery items={items} />
}
