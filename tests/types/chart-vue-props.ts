import type { VueChartTooltipProps } from '../../packages/vue/src/components/ChartTooltip'
import type { VueGaugeChartProps } from '../../packages/vue/src/components/GaugeChart'
import type { VueOrgChartProps } from '../../packages/vue/src/components/OrgChart'

const tooltip: VueChartTooltipProps = {
  id: 'chart-tip',
  content: '值'
}

const gauge: VueGaugeChartProps = {
  value: 40,
  bind: { display: 'pointer' }
}

const org: VueOrgChartProps = {
  data: { id: 'ceo', label: 'Ada' },
  bind: {
    nodes: [{ id: 'ceo', label: 'Ada', children: [{ id: 'eng', label: 'Lin' }] }],
    collapsed: ['eng'],
    query: 'Ada',
    zoom: 1
  }
}

void tooltip
void gauge
void org
