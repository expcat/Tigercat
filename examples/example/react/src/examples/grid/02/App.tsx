import { Row } from '@expcat/tigercat-react/Row'
import { Col } from '@expcat/tigercat-react/Col'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'

export default function App() {
  return (
    <div className="space-y-3">
      <Row gutter={16}>
        <Col span={{ xs: 24, md: 12, lg: 8 }}>
          <div className="rounded bg-[var(--tiger-primary)] p-4 text-center text-[var(--tiger-primary-foreground,#fff)]">
            xs-24 md-12 lg-8 · 数字 gutter 只开横缝
          </div>
        </Col>
        <Col span={{ xs: 24, md: 12, lg: 16 }} offset={{ md: 0 }}>
          <div className="rounded bg-[var(--tiger-secondary,#0d9488)] p-4 text-center text-white">
            xs-24 md-12 lg-16
          </div>
        </Col>
      </Row>
      <Row gutter={[16, 0]}>
        <Col span={6} offset={2}>
          <div className="rounded border border-[var(--tiger-border)] p-3 text-sm">offset 2</div>
        </Col>
        <Col span={{ xs: 0, md: 8 }}>
          <div className="rounded border border-[var(--tiger-border)] p-3 text-sm">
            xs 隐藏，md 起 span 8
          </div>
        </Col>
      </Row>
      <ConfigProvider direction="rtl">
        <Row gutter={16} dir="rtl">
          <Col span={8} offset={4}>
            <div className="rounded border border-[var(--tiger-border)] p-3 text-sm">
              RTL offset 加在 inline-start
            </div>
          </Col>
          <Col span={8}>
            <div className="rounded border border-[var(--tiger-border)] p-3 text-sm">span 8</div>
          </Col>
        </Row>
      </ConfigProvider>
    </div>
  )
}
