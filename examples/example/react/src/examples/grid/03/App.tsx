import { Row } from '@expcat/tigercat-react/Row'
import { Col } from '@expcat/tigercat-react/Col'

export default function App() {
  return (
    <Row gutter={16} justify="space-between" align="middle" wrap={false}>
      <Col flex="120px">
        <div className="rounded bg-amber-500 p-3 text-center text-white">固定</div>
      </Col>
      <Col flex="auto">
        <div className="rounded bg-amber-400 p-6 text-center text-white">自适应</div>
      </Col>
    </Row>
  )
}
