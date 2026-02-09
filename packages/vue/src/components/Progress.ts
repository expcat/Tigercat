import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getProgressVariantClasses,
  getProgressTextColorClasses,
  getStatusVariant,
  formatProgressText,
  clampPercentage,
  calculateCirclePath,
  getCircleSize,
  progressLineBaseClasses,
  progressLineInnerClasses,
  progressTextBaseClasses,
  progressCircleBaseClasses,
  progressLineSizeClasses,
  progressTextSizeClasses,
  progressStripedClasses,
  progressStripedAnimationClasses,
  progressTrackBgClasses,
  progressCircleTextClasses,
  progressCircleTrackStrokeClasses,
  type ProgressProps,
  type ProgressVariant,
  type ProgressSize,
  type ProgressType,
  type ProgressStatus
} from '@expcat/tigercat-core'

export interface VueProgressProps extends ProgressProps {
  style?: Record<string, string | number>
}

export const Progress = defineComponent({
  name: 'TigerProgress',
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<ProgressVariant>, default: 'primary' as ProgressVariant },
    size: { type: String as PropType<ProgressSize>, default: 'md' as ProgressSize },
    type: { type: String as PropType<ProgressType>, default: 'line' as ProgressType },
    percentage: { type: Number, default: 0 },
    status: { type: String as PropType<ProgressStatus>, default: 'normal' as ProgressStatus },
    showText: { type: Boolean, default: undefined },
    text: { type: String, default: undefined },
    format: { type: Function as PropType<(p: number) => string>, default: undefined },
    striped: { type: Boolean, default: false },
    stripedAnimation: { type: Boolean, default: false },
    strokeWidth: { type: Number, default: 6 },
    width: { type: [String, Number], default: 'auto' },
    height: { type: Number, default: undefined },
    className: { type: String, default: undefined },
    style: { type: Object as PropType<Record<string, string | number>>, default: undefined }
  },
  setup(props, { attrs }) {
    const clamped = computed(() => clampPercentage(props.percentage))
    const effectiveVariant = computed(
      () => (getStatusVariant(props.status) || props.variant) as ProgressVariant
    )
    const shouldShowText = computed(() => props.showText ?? props.type === 'line')
    const displayText = computed(() =>
      shouldShowText.value ? formatProgressText(clamped.value, props.text, props.format) : ''
    )
    const resolvedAriaLabel = computed(() => {
      const label = attrs['aria-label'] as string | undefined
      return label ?? (attrs['aria-labelledby'] != null ? undefined : `Progress: ${clamped.value}%`)
    })

    const ariaProps = computed(() => ({
      role: 'progressbar',
      'aria-label': resolvedAriaLabel.value,
      'aria-labelledby': attrs['aria-labelledby'],
      'aria-describedby': attrs['aria-describedby'],
      'aria-valuenow': clamped.value,
      'aria-valuemin': 0,
      'aria-valuemax': 100
    }))

    const renderLineProgress = () => {
      const containerStyle =
        props.width !== 'auto'
          ? { width: typeof props.width === 'number' ? `${props.width}px` : props.width }
          : {}

      return h(
        'div',
        {
          ...attrs,
          class: classNames(
            'flex items-center w-full',
            coerceClassValue(attrs.class),
            props.className
          ),
          style: {
            ...(attrs.style as Record<string, unknown> | undefined),
            ...(props.style ?? {}),
            ...containerStyle
          }
        },
        [
          h(
            'div',
            {
              class: classNames(
                progressLineBaseClasses,
                progressTrackBgClasses,
                !props.height && progressLineSizeClasses[props.size]
              ),
              style: { flex: 1, ...(props.height ? { height: `${props.height}px` } : {}) }
            },
            [
              h('div', {
                class: classNames(
                  progressLineInnerClasses,
                  getProgressVariantClasses(effectiveVariant.value),
                  props.striped && progressStripedClasses,
                  props.striped && props.stripedAnimation && progressStripedAnimationClasses
                ),
                style: { width: `${clamped.value}%` },
                ...ariaProps.value
              })
            ]
          ),
          shouldShowText.value
            ? h(
                'span',
                {
                  class: classNames(
                    progressTextBaseClasses,
                    progressTextSizeClasses[props.size],
                    getProgressTextColorClasses(effectiveVariant.value)
                  )
                },
                displayText.value
              )
            : undefined
        ].filter(Boolean)
      )
    }

    const renderCircleProgress = () => {
      const { width, height, radius, cx, cy } = getCircleSize(props.size, props.strokeWidth)
      const { strokeDasharray, strokeDashoffset } = calculateCirclePath(radius, clamped.value)

      return h(
        'div',
        {
          ...attrs,
          class: classNames(
            progressCircleBaseClasses,
            coerceClassValue(attrs.class),
            props.className
          ),
          style: {
            ...(attrs.style as Record<string, unknown> | undefined),
            ...(props.style ?? {}),
            width: `${width}px`,
            height: `${height}px`
          }
        },
        [
          h('svg', { width, height, viewBox: `0 0 ${width} ${height}` }, [
            h('circle', {
              cx,
              cy,
              r: radius,
              fill: 'none',
              stroke: 'currentColor',
              class: progressCircleTrackStrokeClasses,
              'stroke-width': props.strokeWidth
            }),
            h('circle', {
              cx,
              cy,
              r: radius,
              fill: 'none',
              stroke: 'currentColor',
              class: getProgressVariantClasses(effectiveVariant.value).replace('bg-', 'text-'),
              'stroke-width': props.strokeWidth,
              'stroke-linecap': 'round',
              'stroke-dasharray': strokeDasharray,
              'stroke-dashoffset': strokeDashoffset,
              style: {
                transition: 'stroke-dashoffset 0.3s ease',
                transform: 'rotate(-90deg)',
                transformOrigin: 'center'
              },
              ...ariaProps.value
            })
          ]),
          shouldShowText.value
            ? h(
                'div',
                {
                  class: classNames(
                    progressCircleTextClasses,
                    progressTextSizeClasses[props.size],
                    'font-medium',
                    getProgressTextColorClasses(effectiveVariant.value)
                  )
                },
                displayText.value
              )
            : undefined
        ].filter(Boolean)
      )
    }

    return () => (props.type === 'circle' ? renderCircleProgress() : renderLineProgress())
  }
})

export default Progress
