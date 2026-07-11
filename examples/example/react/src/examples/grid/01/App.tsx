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
            <Row>
              <Col span={24}>
                <div className="bg-blue-500 text-white p-4 rounded text-center">col-24</div>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <div className="bg-blue-600 text-white p-4 rounded text-center">col-12</div>
              </Col>
              <Col span={12}>
                <div className="bg-blue-400 text-white p-4 rounded text-center">col-12</div>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <div className="bg-green-600 text-white p-4 rounded text-center">col-8</div>
              </Col>
              <Col span={8}>
                <div className="bg-green-500 text-white p-4 rounded text-center">col-8</div>
              </Col>
              <Col span={8}>
                <div className="bg-green-400 text-white p-4 rounded text-center">col-8</div>
              </Col>
            </Row>
            <Row>
              <Col span={6}>
                <div className="bg-purple-600 text-white p-4 rounded text-center">col-6</div>
              </Col>
              <Col span={6}>
                <div className="bg-purple-500 text-white p-4 rounded text-center">col-6</div>
              </Col>
              <Col span={6}>
                <div className="bg-purple-400 text-white p-4 rounded text-center">col-6</div>
              </Col>
              <Col span={6}>
                <div className="bg-purple-300 text-white p-4 rounded text-center">col-6</div>
              </Col>
            </Row>
          </Space>
        </Container>
      </div>
    </>
  )
}
