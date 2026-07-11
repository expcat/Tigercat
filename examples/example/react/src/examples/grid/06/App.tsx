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
              <Col span={8} order={3}>
                <div className="bg-fuchsia-500 text-white p-4 rounded text-center">
                  order=3（DOM 第1）
                </div>
              </Col>
              <Col span={8} order={1}>
                <div className="bg-fuchsia-600 text-white p-4 rounded text-center">
                  order=1（DOM 第2）
                </div>
              </Col>
              <Col span={8} order={2}>
                <div className="bg-fuchsia-400 text-white p-4 rounded text-center">
                  order=2（DOM 第3）
                </div>
              </Col>
            </Row>
            <div>
              <p className="text-sm text-gray-600 mb-2">响应式排序（缩小窗口试试）</p>
              <Row gutter={16}>
                <Col span={8} order={{ xs: 3, md: 1 }}>
                  <div className="bg-fuchsia-600 text-white p-4 rounded text-center">
                    xs:3 → md:1
                  </div>
                </Col>
                <Col span={8} order={{ xs: 1, md: 2 }}>
                  <div className="bg-fuchsia-500 text-white p-4 rounded text-center">
                    xs:1 → md:2
                  </div>
                </Col>
                <Col span={8} order={{ xs: 2, md: 3 }}>
                  <div className="bg-fuchsia-400 text-white p-4 rounded text-center">
                    xs:2 → md:3
                  </div>
                </Col>
              </Row>
            </div>
          </Space>
        </Container>
      </div>
    </>
  )
}
