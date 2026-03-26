import { defineComponent, h, computed, type PropType } from 'vue'
import type { StatisticSize } from '@expcat/tigercat-core'
import {
  statisticBaseClasses,
  getStatisticTitleClasses,
  getStatisticValueClasses,
  statisticPrefixClasses,
  statisticSuffixClasses,
  formatStatisticValue,
  classNames,
  coerceClassValue
} from '@expcat/tigercat-core'

export type VueStatisticProps = InstanceType<typeof Statistic>['$props']

export const Statistic = defineComponent({
  name: 'TigerStatistic',
  props: {
    title: { type: String, default: undefined },
    value: { type: [String, Number] as PropType<string | number>, default: undefined },
    precision: { type: Number, default: undefined },
    prefix: { type: String, default: undefined },
    suffix: { type: String, default: undefined },
    groupSeparator: { type: Boolean, default: false },
    size: { type: String as PropType<StatisticSize>, default: 'md' }
  },
  setup(props, { attrs }) {
    const formatted = computed(() =>
      formatStatisticValue(props.value, props.precision, props.groupSeparator)
    )

    return () =>
      h(
        'div',
        {
          class: classNames(statisticBaseClasses, coerceClassValue(attrs.class))
        },
        [
          props.title
            ? h('div', { class: getStatisticTitleClasses(props.size) }, props.title)
            : null,
          h('div', { class: getStatisticValueClasses(props.size) }, [
            props.prefix ? h('span', { class: statisticPrefixClasses }, props.prefix) : null,
            h('span', null, formatted.value),
            props.suffix ? h('span', { class: statisticSuffixClasses }, props.suffix) : null
          ])
        ]
      )
  }
})

export default Statistic
