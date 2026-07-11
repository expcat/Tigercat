import React from 'react'
import { Row } from '@expcat/tigercat-react/Row'
import { Col } from '@expcat/tigercat-react/Col'
import { Container } from '@expcat/tigercat-react/Container'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <Container>
          <Row gutter={16}>
            <Col span={0} flex={1}>
              <div className="bg-slate-700 text-white p-4 rounded text-center">flex=1</div>
            </Col>
            <Col span={0} flex={2}>
              <div className="bg-slate-600 text-white p-4 rounded text-center">flex=2</div>
            </Col>
            <Col span={0} flex="0_0_160px">
              <div className="bg-slate-500 text-white p-4 rounded text-center">flex=0 0 160px</div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  )
}
