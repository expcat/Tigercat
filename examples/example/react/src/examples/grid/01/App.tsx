import { Row } from '@expcat/tigercat-react/Row'
import { Col } from '@expcat/tigercat-react/Col'

export default function App() {
  return (
    <div className="rounded border border-[var(--tiger-border)] p-3">
      <Row gutter={[16, 16]}>
        {[1, 2, 3].map((item) => (
          <Col key={item} span={8}>
            <div className="rounded bg-[var(--tiger-primary)] p-4 text-center text-[var(--tiger-primary-foreground,#fff)]">
              col-8
            </div>
          </Col>
        ))}
      </Row>
    </div>
  )
}
