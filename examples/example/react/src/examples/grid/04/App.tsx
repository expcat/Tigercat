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
            <p className="text-sm font-medium text-gray-700">justify 水平分布</p>
            {(
              ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'] as const
            ).map((j) => (
              <div key={j}>
                <p className="text-sm text-gray-600 mb-1">justify: {j}</p>
                <Row gutter={16} justify={j}>
                  <Col span={4}>
                    <div className="bg-amber-500 text-white p-3 rounded text-center">A</div>
                  </Col>
                  <Col span={4}>
                    <div className="bg-amber-400 text-white p-3 rounded text-center">B</div>
                  </Col>
                  <Col span={4}>
                    <div className="bg-amber-300 text-white p-3 rounded text-center">C</div>
                  </Col>
                </Row>
              </div>
            ))}

            <p className="text-sm font-medium text-gray-700 mt-4">align 垂直对齐</p>
            {(['top', 'middle', 'bottom', 'stretch'] as const).map((a) => (
              <div key={a}>
                <p className="text-sm text-gray-600 mb-1">align: {a}</p>
                <Row gutter={16} align={a}>
                  <Col span={8}>
                    <div className="bg-rose-500 text-white p-3 rounded text-center h-8 flex items-center justify-center">
                      h-8
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="bg-rose-400 text-white p-3 rounded text-center h-16 flex items-center justify-center">
                      h-16
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="bg-rose-300 text-white p-3 rounded text-center h-12 flex items-center justify-center">
                      h-12
                    </div>
                  </Col>
                </Row>
              </div>
            ))}
          </Space>
        </Container>
      </div>
    </>
  )
}
