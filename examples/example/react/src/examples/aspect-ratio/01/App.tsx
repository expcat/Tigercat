import { AspectRatio } from '@expcat/tigercat-react/AspectRatio'

const cover = 'https://picsum.photos/seed/tiger-ratio/640/360'

export default function App() {
  return (
    <div className="w-full max-w-md space-y-4">
      <figure>
        <AspectRatio className="rounded-lg border border-gray-200 dark:border-gray-700">
          <img src={cover} alt="" />
        </AspectRatio>
        <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          省略 ratio 时使用 16/9，图片铺满并裁进圆角。
        </figcaption>
      </figure>
      <AspectRatio
        ratio="4/3"
        className="rounded-lg border border-gray-200 dark:border-gray-700"
        contentClassName="bg-gradient-to-br from-emerald-500 to-teal-600">
        <div className="flex h-full items-center justify-center">
          <span className="text-sm font-medium text-white">分数字符串 4/3</span>
        </div>
      </AspectRatio>
    </div>
  )
}
