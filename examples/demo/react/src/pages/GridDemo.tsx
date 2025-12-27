import React from 'react'
import { Link } from 'react-router-dom'
import { Row, Col, Container, Space } from '@tigercat/react'

const GridDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Grid 栅格</h1>
        <p className="text-gray-600">通过基础的 24 分栏，迅速简便地创建布局。</p>
      </div>

      {/* 基础栅格 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基础栅格</h2>
        <p className="text-gray-600 mb-6">使用单一分栏创建基础的栅格布局。</p>
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
      </section>

      {/* 分栏间隔 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">分栏间隔</h2>
        <p className="text-gray-600 mb-6">分栏之间存在间隔。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Container>
            <Space direction="vertical" className="w-full">
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
            </Space>
          </Container>
        </div>
      </section>

      {/* 混合布局 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">混合布局</h2>
        <p className="text-gray-600 mb-6">通过基础的 1/24 分栏任意扩展组合形成较为复杂的混合布局。</p>
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
      </section>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <Link to="/" className="text-blue-600 hover:text-blue-800">← 返回首页</Link>
      </div>
    </div>
  )
}

export default GridDemo
