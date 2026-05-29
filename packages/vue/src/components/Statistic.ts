import { defineComponent, h, ref, computed, watch, onBeforeUnmount, type PropType } from 'vue'
import type { StatisticSize } from '@expcat/tigercat-core'
import {
  statisticBaseClasses,
  getStatisticTitleClasses,
  getStatisticValueClasses,
  statisticPrefixClasses,
  statisticSuffixClasses,
  formatStatisticValue,
  canAnimateStatisticValue,
  createStatisticNumberAnimation,
  type StatisticNumberAnimationController,
  classNames,
  coerceClassValue
} from '@expcat/tigercat-core'

export type VueStatisticProps = InstanceType<typeof Statistic>['$props']

export const Statistic = defineComponent({
  name: 'TigerStatistic',
  inheritAttrs: false,
  props: {
    title: { type: String, default: undefined },
    value: { type: [String, Number] as PropType<string | number>, default: undefined },
    precision: { type: Number, default: undefined },
    prefix: { type: String, default: undefined },
    suffix: { type: String, default: undefined },
    groupSeparator: { type: Boolean, default: false },
    animated: { type: Boolean, default: false },
    animationDuration: { type: Number, default: undefined },
    size: { type: String as PropType<StatisticSize>, default: 'md' },
    className: { type: String, default: undefined }
  },
  setup(props, { attrs }) {
    const initialValue = props.animated && canAnimateStatisticValue(props.value) ? 0 : props.value
    const displayValue = ref<string | number | undefined>(initialValue)
    const currentNumber = ref(canAnimateStatisticValue(initialValue) ? initialValue : 0)
    let controller: StatisticNumberAnimationController | null = null

    const stopAnimation = () => {
      controller?.stop()
      controller = null
    }

    watch(
      () => [props.value, props.animated, props.animationDuration] as const,
      () => {
        stopAnimation()

        if (!props.animated || !canAnimateStatisticValue(props.value)) {
          displayValue.value = props.value
          if (canAnimateStatisticValue(props.value)) currentNumber.value = props.value
          return
        }

        controller = createStatisticNumberAnimation({
          from: currentNumber.value,
          to: props.value,
          duration: props.animationDuration,
          onUpdate: (next) => {
            currentNumber.value = next
            displayValue.value = next
          },
          onComplete: () => {
            currentNumber.value = props.value as number
            displayValue.value = props.value
            controller = null
          }
        })
      },
      { immediate: true }
    )

    onBeforeUnmount(stopAnimation)

    const formatted = computed(() =>
      formatStatisticValue(displayValue.value, props.precision, props.groupSeparator)
    )

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: classNames(
            statisticBaseClasses,
            props.className,
            coerceClassValue((attrs as Record<string, unknown>).class)
          )
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
