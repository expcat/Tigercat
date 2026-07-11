import { CropUpload } from '@expcat/tigercat-react/CropUpload'

export default function App() {
  return (
    <CropUpload onCropComplete={(result) => console.log(result)}>
      <span className="inline-flex cursor-pointer items-center gap-2 rounded bg-green-600 px-4 py-2 text-white">
        📷 上传头像
      </span>
    </CropUpload>
  )
}
