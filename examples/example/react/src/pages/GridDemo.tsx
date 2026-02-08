import React from 'react'
import { Row, Col, Container, Space } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Row>
  <Col span={24}>col-24</Col>
  <Col span={12}>col-12</Col>
  <Col span={12}>col-12</Col>
  <Col span={8}>col-8</Col>
  <Col span={8}>col-8</Col>
  <Col span={8}>col-8</Col>
  <Col span={6}>col-6</Col>
  <Col span={6}>col-6</Col>
  <Col span={6}>col-6</Col>
  <Col span={6}>col-6</Col>
</Row>`

const gutterSnippet = `<Row gutter={16}>...</Row>
<Row gutter={[16, 16]}>...</Row>`

const responsiveSnippet = `<Row gutter={[16, 16]}>
  <Col span={{ xs: 24, md: 12, lg: 8 }}>...</Col>
  <Col span={{ xs: 24, md: 6, lg: 6 }}>...</Col>
  <Col span={{ xs: 24, md: 4, lg: 6 }}>...</Col>
  <Col span={{ xs: 24, md: 2, lg: 4 }}>...</Col>
</Row>
<Row gutter={16}>
  <Col span={8}>...</Col>
  <Col span={8} offset={{ xs: 0, md: 8 }}>...</Col>
</Row>`

const alignSnippet = `{/* justify 水平分布 */}
<Row justify="start | center | end | space-between | space-around | space-evenly">
  ...
</Row>
{/* align 垂直对齐 */}
<Row align="top | middle | bottom | stretch">
  ...
</Row>`

const offsetSnippet = `<Row gutter={16}>
  <Col span={8}>...</Col>
  <Col span={8} offset={8}>...</Col>
</Row>
<Row gutter={16}>
  <Col span={6} offset={6}>...</Col>
  <Col span={6} offset={6}>...</Col>
</Row>`

const orderSnippet = `<Row gutter={16}>
  <Col span={8} order={3}>...</Col>
  <Col span={8} order={1}>...</Col>
  <Col span={8} order={2}>...</Col>
</Row>
{/* 响应式排序 */}
<Row gutter={16}>
  <Col span={8} order={{ xs: 3, md: 1 }}>...</Col>
  <Col span={8} order={{ xs: 1, md: 2 }}>...</Col>
  <Col span={8} order={{ xs: 2, md: 3 }}>...</Col>
</Row>`

const nowrapSnippet = `<Row gutter={16} wrap={false} className="min-w-[720px]">...</Row>`

const flexSnippet = `<Row gutter={16}>
  <Col span={0} flex={1}>...</Col>
  <Col span={0} flex={2}>...</Col>
  <Col span={0} flex="0_0_160px">...</Col>
</Row>`

const mixedSnippet = `<Row gutter={16}>
  <Col span={16}>...</Col>
  <Col span={8}>...</Col>
</Row>
<Row gutter={16}>
  <Col span={8}>...</Col>
  <Col span={8}>...</Col>
  <Col span={4}>...</Col>
  <Col span={4}>...</Col>
</Row>`

const GridDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Grid 栅格</h1>
        <p className="text-gray-600">通过基础的 24 分栏，迅速简便地创建布局。</p>
      </div>

      <DemoBlock
        title="基础栅格"
        description="使用单一分栏创建基础的栅格布局。"
        code={basicSnippet}>
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
      </DemoBlock>

      <DemoBlock
        title="分栏间隔"
        description="支持水平间距或 [水平, 垂直] 的间距数组。"
        code={gutterSnippet}>
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
      </DemoBlock>

      <DemoBlock
        title="响应式栅格"
        description="span / offset 支持按断点设置（xs, sm, md, lg, xl, 2xl）。"
        code={responsiveSnippet}>
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
      </DemoBlock>

      <DemoBlock
        title="Row 对齐与分布"
        description="justify 控制水平分布，align 控制垂直对齐。"
        code={alignSnippet}>
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
      </DemoBlock>

      <DemoBlock
        title="列偏移"
        description="使用 offset 在 24 栅格内做留白与对齐。"
        code={offsetSnippet}>
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
      </DemoBlock>

      <DemoBlock
        title="列排序"
        description="使用 order 改变列的显示顺序（不改变 DOM 顺序），支持响应式。"
        code={orderSnippet}>
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
      </DemoBlock>

      <DemoBlock
        title="不换行（wrap=false）"
        description="当总宽度超过 24 栅格时，不换行会导致横向溢出。"
        code={nowrapSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Container>
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
      </DemoBlock>

      <DemoBlock
        title="Flex 自适应"
        description="使用 flex 进行比例分配（建议与 span=0 搭配）。"
        code={flexSnippet}>
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
                <div className="bg-slate-500 text-white p-4 rounded text-center">
                  flex=0 0 160px
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </DemoBlock>

      <DemoBlock
        title="混合布局"
        description="通过基础的 1/24 分栏任意扩展组合形成较为复杂的混合布局。"
        code={mixedSnippet}>
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
      </DemoBlock>
    </div>
  )
}

export default GridDemo
