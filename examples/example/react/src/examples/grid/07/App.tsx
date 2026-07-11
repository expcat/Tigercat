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
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
            窄屏下可在下方区域横向滚动，查看不换行的后续栅格。
          </p>
          <div className="overflow-x-auto overflow-y-hidden px-2">
            <Row gutter={16} wrap={false} className="min-w-[720px]">
              <Col span={6}>
                <div className="bg-emerald-600 text-white p-4 rounded text-center">6</div>
              </Col>
              <Col span={6}>
                <div className="bg-emerald-500 text-white p-4 rounded text-center">6</div>
              </Col>
              <Col span={6}>
                <div className="bg-emerald-400 text-white p-4 rounded text-center">6</div>
              </Col>
              <Col span={6}>
                <div className="bg-emerald-300 text-white p-4 rounded text-center">6</div>
              </Col>
              <Col span={6}>
                <div className="bg-emerald-600 text-white p-4 rounded text-center">6</div>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </>
  )
}
