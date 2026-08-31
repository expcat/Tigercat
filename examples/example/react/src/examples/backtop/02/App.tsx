import { BackTop } from '@expcat/tigercat-react/BackTop'

export default function App() {
  return (
    <div id="backtop-demo-container" className="relative h-64 overflow-auto rounded border">
      <div className="h-[900px] p-4">
        <p>在此容器内向下滚动。target 与 Affix 一样是滚动根选择器。</p>
      </div>
      <BackTop target="#backtop-demo-container" visibilityHeight={100} position="sticky" />
    </div>
  )
}
