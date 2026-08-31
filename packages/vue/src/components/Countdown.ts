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
    /**
     * First-paint / SSR clock snapshot only. After mount, ticks use `Date.now()`.
     * Changing `now` updates the display and does not restart the interval.
     */
    now: {
      type: [String, Number, Date] as PropType<CountdownValue>,
      default: undefined
    },
    /**
     * `HH` is total hours unless `D`/`DD` is present. `SSS` needs a smaller interval.
     * @default 'HH:mm:ss'
     */
    format: {
      type: String,
      default: COUNTDOWN_DEFAULT_FORMAT
    },
    /**
     * Tick period in ms. `<= 0` disables the timer.
     * @default 1000
     */
    interval: {
      type: Number,
      default: COUNTDOWN_DEFAULT_INTERVAL_MS
    },
    /**
     * Visible title above the value. Not an HTML tooltip. Slot `title` wins.
     */
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
  setup(props, { attrs, emit, slots }) {
    const remaining = ref(
      props.now !== undefined ? getCountdownRemaining(props.value, props.now) : 0
    )
    const formatted = computed(() => formatCountdown(remaining.value, props.format))
    let finished = remaining.value <= 0
    let mounted = false
    let timerId: ReturnType<typeof setInterval> | null = null

    const stopTimer = () => {
      if (timerId !== null) clearInterval(timerId)
      timerId = null
    }

    const syncRemainingFromSnapshot = () => {
      remaining.value =
        props.now !== undefined || !mounted
          ? getCountdownRemaining(props.value, props.now)
          : getCountdownRemaining(props.value)
      finished = remaining.value <= 0
    }

    const tick = () => {
      const nextRemaining = getCountdownRemaining(props.value)
      const payload = createCountdownPayload(nextRemaining, props.format)

      remaining.value = nextRemaining
      emit('change', payload)

      if (nextRemaining <= 0) {
        if (!finished) {
          finished = true
          emit('finish', payload)
        }
        stopTimer()
      }
    }

    const setupTimer = () => {
      stopTimer()
      if (!mounted || props.interval <= 0 || props.value === undefined) return
      if (getCountdownRemaining(props.value) <= 0) return
      timerId = setInterval(tick, props.interval)
    }

    watch(
      () => props.value,
      () => {
        syncRemainingFromSnapshot()
        setupTimer()
      }
    )

    watch(
      () => props.now,
      () => {
        remaining.value = getCountdownRemaining(props.value, props.now)
        finished = remaining.value <= 0
      }
    )

    watch(
      () => [props.interval, props.format] as const,
      () => setupTimer()
    )

    onMounted(() => {
      mounted = true
      if (props.now === undefined) {
        remaining.value = getCountdownRemaining(props.value)
        finished = remaining.value <= 0
      }
      setupTimer()
    })

    onBeforeUnmount(() => {
      mounted = false
      stopTimer()
    })

    return () => {
      const titleNode = slots.title?.() ?? props.title
      const prefixNode = slots.prefix?.() ?? props.prefix
      const suffixNode = slots.suffix?.() ?? props.suffix
      const rootAriaLabel = props.ariaLabel ?? (attrs['aria-label'] as string | undefined)

      return h(
        'div',
        {
          ...attrs,
          class: classNames(countdownBaseClasses, props.className, coerceClassValue(attrs.class)),
          role: rootAriaLabel ? 'group' : (attrs.role as string | undefined),
          'aria-label': rootAriaLabel
        },
        [
          titleNode ? h('div', { class: getCountdownTitleClasses(props.size) }, titleNode) : null,
          h('div', { class: countdownValueWrapperClasses }, [
            prefixNode ? h('span', { class: countdownPrefixClasses }, prefixNode) : null,
            h(
              'span',
              {
                class: getCountdownValueClasses(props.size),
                role: 'timer'
              },
              formatted.value
            ),
            suffixNode ? h('span', { class: countdownSuffixClasses }, suffixNode) : null
          ])
        ]
      )
    }
  }
})

export type VueCountdownProps = InstanceType<typeof Countdown>['$props']
export type CountdownProps = VueCountdownProps
export type { CountdownChangePayload, CountdownValue }

export default Countdown
