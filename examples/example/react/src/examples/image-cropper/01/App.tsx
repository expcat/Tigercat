import { ImageCropper } from '@expcat/tigercat-react/ImageCropper'

const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="#bae6fd"/><circle cx="470" cy="105" r="55" fill="#facc15"/><path d="M0 330 170 150l110 120 90-95 270 225H0Z" fill="#0f766e"/></svg>'
)}`

export default function App() {
  return <ImageCropper src={source} aspectRatio={1} />
}
