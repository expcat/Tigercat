import { computed, defineComponent, h, onBeforeUnmount, onMounted, PropType, ref, watch } from 'vue'
import {
  COUNTDOWN_DEFAULT_FORMAT,
  COUNTDOWN_DEFAULT_INTERVAL_MS,
  classNames,
  coerceClassValue,
  countdownBaseClasses,
  countdownPrefixClasses,
  countdownSuffixClasses,
  countdownValueWrapperClasses,
  createCountdownPayload,
  formatCountdown,
  getCountdownRemaining,
  getCountdownTitleClasses,
  getCountdownValueClasses,
  type CountdownChangePayload,
  type CountdownSize,
  type CountdownValue
} from '@expcat/tigercat-core'

export const Countdown = defineComponent({
  name: 'TigerCountdown',
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number, Date] as PropType<CountdownValue>,
      default: undefined
    },
    now: {
      type: [String, Number, Date] as PropType<CountdownValue>,
      default: undefined
    },
    format: {
      type: String,
      default: COUNTDOWN_DEFAULT_FORMAT
    },
    interval: {
      type: Number,
      default: COUNTDOWN_DEFAULT_INTERVAL_MS
    },
    title: {
      type: String,
      default: undefined
    },
    prefix: {
      type: String,
      default: undefined
    },
    suffix: {
      type: String,
      default: undefined
    },
    size: {
      type: String as PropType<CountdownSize>,
      default: 'md'
    },
    ariaLabel: {
      type: String,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    }
  },
  emits: ['change', 'finish'],
  setup(props, { attrs, emit }) {
    const remaining = ref(getCountdownRemaining(props.value, props.now))
    const formatted = computed(() => formatCountdown(remaining.value, props.format))
    let finished = remaining.value <= 0
    let mounted = false
    let timerId: ReturnType<typeof setInterval> | null = null

    const stopTimer = () => {
      if (timerId !== null) clearInterval(timerId)
      timerId = null
    }

    const tick = () => {
      const nextRemaining = getCountdownRemaining(props.value)
      const payload = createCountdownPayload(nextRemaining, props.format)

      remaining.value = nextRemaining
      emit('change', payload)

      if (nextRemaining <= 0 && !finished) {
        finished = true
        emit('finish', payload)
        stopTimer()
      }
    }

    const setupTimer = () => {
      stopTimer()
      if (!mounted || props.interval <= 0 || props.value === undefined) return
      timerId = setInterval(tick, props.interval)
    }

    watch(
      () => [props.value, props.now] as const,
      () => {
        remaining.value = getCountdownRemaining(props.value, props.now)
        finished = remaining.value <= 0
        setupTimer()
      },
      { immediate: true }
    )

    watch(
      () => [props.interval, props.format] as const,
      () => setupTimer()
    )

    onMounted(() => {
      mounted = true
      setupTimer()
    })

    onBeforeUnmount(() => {
      mounted = false
      stopTimer()
    })

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: classNames(countdownBaseClasses, props.className, coerceClassValue(attrs.class))
        },
        [
          props.title
            ? h('div', { class: getCountdownTitleClasses(props.size) }, props.title)
            : null,
          h('div', { class: countdownValueWrapperClasses }, [
            props.prefix ? h('span', { class: countdownPrefixClasses }, props.prefix) : null,
            h(
              'span',
              {
                class: getCountdownValueClasses(props.size),
                role: 'timer',
                'aria-live': 'polite',
                'aria-label': props.ariaLabel
              },
              formatted.value
            ),
            props.suffix ? h('span', { class: countdownSuffixClasses }, props.suffix) : null
          ])
        ]
      )
  }
})

export type VueCountdownProps = InstanceType<typeof Countdown>['$props']
export type { CountdownChangePayload, CountdownValue }

export default Countdown
