import { Skeleton } from '@expcat/tigercat-react/Skeleton'

export default function App() {
  return (
    <div className="space-y-6">
      <Skeleton variant="text" rows={3} paragraph animation="wave" />
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" shape="circle" />
        <div className="flex-1">
          <Skeleton variant="text" />
        </div>
      </div>
      <Skeleton variant="image" />
      <Skeleton variant="button" />
    </div>
  )
}
