import { ImageCropper } from '@expcat/tigercat-react/ImageCropper'

export default function App() {
  return (
    <ImageCropper src="https://picsum.photos/seed/crop-ratio/640/480" aspectPreset="1:1" circular />
  )
}
