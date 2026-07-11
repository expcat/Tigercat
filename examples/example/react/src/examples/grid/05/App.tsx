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
          <Space direction="vertical" className="w-full">
            <Row gutter={16}>
              <Col span={8}>
                <div className="bg-blue-600 text-white p-4 rounded text-center">span=8</div>
              </Col>
              <Col span={8} offset={8}>
                <div className="bg-blue-500 text-white p-4 rounded text-center">
                  span=8 offset=8
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6} offset={6}>
                <div className="bg-blue-600 text-white p-4 rounded text-center">
                  span=6 offset=6
                </div>
              </Col>
              <Col span={6} offset={6}>
                <div className="bg-blue-500 text-white p-4 rounded text-center">
                  span=6 offset=6
                </div>
              </Col>
            </Row>
          </Space>
        </Container>
      </div>
    </>
  )
}
