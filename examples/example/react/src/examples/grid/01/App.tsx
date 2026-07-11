import { Row } from '@expcat/tigercat-react/Row'
import { Col } from '@expcat/tigercat-react/Col'

export default function App() {
  return (
    <Row gutter={[16, 16]}>
      {[1, 2, 3].map((item) => (
        <Col key={item} span={8}>
          <div className="rounded bg-blue-600 p-4 text-center text-white">col-8</div>
        </Col>
      ))}
    </Row>
  )
}
