import { Watermark } from '@expcat/tigercat-react/Watermark'

const watermarkImage =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%2264%22 viewBox=%220 0 120 64%22%3E%3Crect width=%22120%22 height=%2264%22 rx=%2214%22 fill=%22%232563eb%22 fill-opacity=%220.12%22/%3E%3Cpath d=%22M22 42L38 22L53 42M45 33H31%22 fill=%22none%22 stroke=%22%232563eb%22 stroke-width=%225%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3Ctext x=%2264%22 y=%2239%22 font-family=%22Arial%22 font-size=%2216%22 font-weight=%22700%22 fill=%22%232563eb%22%3ETC%3C/text%3E%3C/svg%3E'

export default function App() {
  return (
    <>
      <Watermark image={watermarkImage} width={120} height={64} gapX={120} gapY={80}>
        <div style={{ height: 300 }} className="bg-gray-50 rounded-lg p-4">
          <p>使用 image 属性可以展示图片水印，适合品牌标识或图形化保密标记。</p>
        </div>
      </Watermark>
    </>
  )
}
