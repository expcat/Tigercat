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
            <div>
              <p className="text-sm text-gray-600 mb-2">gutter: 16</p>
              <Row gutter={16}>
                <Col span={6}>
                  <div className="bg-blue-500 text-white p-4 rounded text-center">col-6</div>
                </Col>
                <Col span={6}>
                  <div className="bg-blue-500 text-white p-4 rounded text-center">col-6</div>
                </Col>
                <Col span={6}>
                  <div className="bg-blue-500 text-white p-4 rounded text-center">col-6</div>
                </Col>
                <Col span={6}>
                  <div className="bg-blue-500 text-white p-4 rounded text-center">col-6</div>
                </Col>
              </Row>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">gutter: [16, 16]（水平+垂直）</p>
              <div className="py-2">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className="bg-indigo-500 text-white p-4 rounded text-center">col-12</div>
                  </Col>
                  <Col span={12}>
                    <div className="bg-indigo-400 text-white p-4 rounded text-center">col-12</div>
                  </Col>
                  <Col span={8}>
                    <div className="bg-indigo-500 text-white p-4 rounded text-center">col-8</div>
                  </Col>
                  <Col span={8}>
                    <div className="bg-indigo-400 text-white p-4 rounded text-center">col-8</div>
                  </Col>
                  <Col span={8}>
                    <div className="bg-indigo-300 text-white p-4 rounded text-center">col-8</div>
                  </Col>
                </Row>
              </div>
            </div>
          </Space>
        </Container>
      </div>
    </>
  )
}
