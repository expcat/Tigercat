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
              <Col span={16}>
                <div className="bg-green-500 text-white p-4 rounded text-center">col-16</div>
              </Col>
              <Col span={8}>
                <div className="bg-green-500 text-white p-4 rounded text-center">col-8</div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <div className="bg-green-500 text-white p-4 rounded text-center">col-8</div>
              </Col>
              <Col span={8}>
                <div className="bg-green-500 text-white p-4 rounded text-center">col-8</div>
              </Col>
              <Col span={4}>
                <div className="bg-green-500 text-white p-4 rounded text-center">col-4</div>
              </Col>
              <Col span={4}>
                <div className="bg-green-500 text-white p-4 rounded text-center">col-4</div>
              </Col>
            </Row>
          </Space>
        </Container>
      </div>
    </>
  )
}
