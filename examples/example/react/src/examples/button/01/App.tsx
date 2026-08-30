import { Button } from '@expcat/tigercat-react/Button'

const star = <span aria-hidden="true">★</span>

export default function App() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Button>保存</Button>
      <Button size="sm">小号</Button>
      <Button disabled>禁用</Button>
      <Button danger>删除</Button>
      <Button icon={star}>收藏</Button>
      <Button icon={star} iconPosition="end">
        后缀图标
      </Button>
      <Button icon={star} aria-label="收藏" />
      <Button loading>提交中</Button>
    </div>
  )
}
