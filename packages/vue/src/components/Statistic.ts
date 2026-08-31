import {
  defineComponent,
  h,
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  type PropType
} from 'vue'
import type { ComponentSize, TigerLocale } from '@expcat/tigercat-core'
import {
  statisticBaseClasses,
  getStatisticTitleClasses,
  getStatisticValueClasses,
  statisticPrefixClasses,
  statisticSuffixClasses,
  formatStatisticValue,
  canAnimateStatisticValue,
  createStatisticNumberAnimation,
  resolveStatisticPrecision,
  statisticPrefersReducedMotion,
  type StatisticNumberAnimationController,
  classNames,
  coerceClassValue,
  mergeTigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

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
    size: { type: String as PropType<ComponentSize>, default: 'md' },
    className: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined }
  },
  setup(props, { attrs, slots }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const displayValue = ref<string | number | undefined>(props.value)
    const currentNumber = ref(canAnimateStatisticValue(props.value) ? props.value : 0)
    let controller: StatisticNumberAnimationController | null = null
    let hasPlayed = false
    let mounted = false

    const stopAnimation = () => {
      controller?.stop()
      controller = null
    }

    const startAnimation = () => {
      stopAnimation()

      if (
        !props.animated ||
        !canAnimateStatisticValue(props.value) ||
        statisticPrefersReducedMotion()
      ) {
        displayValue.value = props.value
        if (canAnimateStatisticValue(props.value)) currentNumber.value = props.value
        return
      }

      const from = hasPlayed ? currentNumber.value : 0
      hasPlayed = true
      controller = createStatisticNumberAnimation({
        from,
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
    }

    onMounted(() => {
      mounted = true
      startAnimation()
    })

    watch(
      () => [props.value, props.animated, props.animationDuration] as const,
      () => {
        if (!mounted) {
          displayValue.value = props.value
          return
        }
        startAnimation()
      }
    )

    onBeforeUnmount(stopAnimation)

    const formatted = computed(() => {
      const precision = canAnimateStatisticValue(props.value)
        ? resolveStatisticPrecision(props.value, props.precision)
        : props.precision
      return formatStatisticValue(
        displayValue.value,
        precision,
        props.groupSeparator,
        mergedLocale.value?.locale
      )
    })

    return () => {
      const titleContent = slots.title ? slots.title() : props.title
      const prefixContent = slots.prefix ? slots.prefix() : props.prefix
      const suffixContent = slots.suffix ? slots.suffix() : props.suffix

      return h(
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
          titleContent
            ? h('div', { class: getStatisticTitleClasses(props.size) }, titleContent)
            : null,
          h('div', { class: getStatisticValueClasses(props.size) }, [
            prefixContent ? h('span', { class: statisticPrefixClasses }, prefixContent) : null,
            h('span', null, formatted.value),
            suffixContent ? h('span', { class: statisticSuffixClasses }, suffixContent) : null
          ])
        ]
      )
    }
  }
})

export default Statistic
