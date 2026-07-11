import { Row } from '@expcat/tigercat-react/Row'
import { Col } from '@expcat/tigercat-react/Col'

export default function App() {
  return (
    <Row gutter={16}>
      <Col span={{ xs: 24, md: 12, lg: 8 }}>
        <div className="rounded bg-teal-600 p-4 text-center text-white">xs-24 md-12 lg-8</div>
      </Col>
      <Col span={{ xs: 24, md: 12, lg: 16 }}>
        <div className="rounded bg-teal-500 p-4 text-center text-white">xs-24 md-12 lg-16</div>
      </Col>
    </Row>
  )
}
