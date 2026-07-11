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
            <Row gutter={[16, 16]}>
              <Col span={{ xs: 24, md: 12, lg: 8 }}>
                <div className="bg-teal-600 text-white p-4 rounded text-center">
                  xs-24 md-12 lg-8
                </div>
              </Col>
              <Col span={{ xs: 24, md: 6, lg: 6 }}>
                <div className="bg-teal-500 text-white p-4 rounded text-center">
                  xs-24 md-6 lg-6
                </div>
              </Col>
              <Col span={{ xs: 24, md: 4, lg: 6 }}>
                <div className="bg-teal-400 text-white p-4 rounded text-center">
                  xs-24 md-4 lg-6
                </div>
              </Col>
              <Col span={{ xs: 24, md: 2, lg: 4 }}>
                <div className="bg-teal-300 text-white p-4 rounded text-center">
                  xs-24 md-2 lg-4
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <div className="bg-cyan-600 text-white p-4 rounded text-center">span=8</div>
              </Col>
              <Col span={8} offset={{ xs: 0, md: 8 }}>
                <div className="bg-cyan-500 text-white p-4 rounded text-center">offset: md-8</div>
              </Col>
            </Row>
          </Space>
        </Container>
      </div>
    </>
  )
}
