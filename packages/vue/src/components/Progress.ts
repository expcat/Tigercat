import { computed, defineComponent, h, PropType } from 'vue'
import {
  calculateCirclePath,
  classNames,
  coerceClassValue,
  getCircleSize,
  getProgressFillClasses,
  getProgressLabels,
  getProgressStrokeClasses,
  getProgressTextColorClasses,
  progressCircleBaseClasses,
  progressCircleTextClasses,
  progressCircleTrackStrokeClasses,
  progressLineBaseClasses,
  progressLineSizeClasses,
  progressTextBaseClasses,
  progressTextSizeClasses,
  progressTrackBgClasses,
  progressStepFilled,
  resolveProgressView,
  type ProgressProps,
  type ProgressSize,
  type ProgressStatus,
  type ProgressType,
  type ProgressVariant
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'

export interface VueProgressProps extends ProgressProps {
  style?: Record<string, string | number>
}

export type { ProgressProps }

function pickAria(attrs: Record<string, unknown>) {
  const rest: Record<string, unknown> = { ...attrs }
  const ariaLabel = rest['aria-label'] as string | undefined
  const ariaLabelledby = rest['aria-labelledby']
  const ariaDescribedby = rest['aria-describedby']
  delete rest['aria-label']
  delete rest['aria-labelledby']
  delete rest['aria-describedby']
  delete rest.role
  delete rest.class
  delete rest.style
  return { rest, ariaLabel, ariaLabelledby, ariaDescribedby }
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
    style: { type: Object as PropType<Record<string, string | number>>, default: undefined },
    indeterminate: { type: Boolean, default: false },
    steps: { type: Number, default: undefined }
  },
  setup(props, { attrs }) {
    const config = useTigerConfig()

    const view = computed(() => {
      const { ariaLabel, ariaLabelledby } = pickAria(attrs as Record<string, unknown>)
      return resolveProgressView({
        percentage: props.percentage,
        variant: props.variant,
        status: props.status,
        type: props.type,
        showText: props.showText,
        text: props.text,
        format: props.format,
        striped: props.striped,
        stripedAnimation: props.stripedAnimation,
        ariaLabel,
        ariaLabelledby: ariaLabelledby as string | undefined,
        widgetName: getProgressLabels(config.value.locale).ariaLabel,
        indeterminate: props.indeterminate,
        steps: props.steps,
        locales: config.value.locale?.locale
      })
    })

    const ariaProps = computed(() => {
      const { ariaLabelledby, ariaDescribedby } = pickAria(attrs as Record<string, unknown>)
      return {
        role: 'progressbar',
        'aria-label': view.value.ariaLabel,
        'aria-labelledby': ariaLabelledby,
        'aria-describedby': ariaDescribedby,
        'aria-valuenow': view.value.valueNow,
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuetext': view.value.valueText
      }
    })

    const renderLineProgress = () => {
      const { rest } = pickAria(attrs as Record<string, unknown>)
      const containerStyle =
        props.width !== 'auto'
          ? { width: typeof props.width === 'number' ? `${props.width}px` : props.width }
          : {}

      return h(
        'div',
        {
          ...rest,
          class: classNames(
            'flex items-center w-full',
            view.value.paused && 'tiger-progress-paused',
            coerceClassValue(attrs.class),
            props.className
          ),
          style: {
            ...(attrs.style as Record<string, unknown> | undefined),
            ...(props.style ?? {}),
            ...containerStyle
          },
          ...ariaProps.value
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
            view.value.steps > 1
              ? progressStepFilled(view.value.steps, view.value.percentage).map((filled, index) =>
                  h('div', {
                    key: index,
                    class: classNames(getProgressFillClasses(view.value), 'inline-block h-full'),
                    style: {
                      width: `${100 / view.value.steps}%`,
                      opacity: filled ? 1 : 0.25
                    },
                    'data-tiger-progress-step': filled ? 'on' : 'off'
                  })
                )
              : [
                  h('div', {
                    class: classNames(
                      getProgressFillClasses(view.value),
                      view.value.indeterminate && 'tiger-progress-indeterminate'
                    ),
                    style: view.value.indeterminate
                      ? undefined
                      : { width: `${view.value.percentage}%` },
                    'data-tiger-progress-success': view.value.successMark ? '' : undefined
                  })
                ]
          ),
          view.value.shouldShowText
            ? h(
                'span',
                {
                  class: classNames(
                    progressTextBaseClasses,
                    progressTextSizeClasses[props.size],
                    getProgressTextColorClasses(view.value.effectiveVariant)
                  )
                },
                view.value.displayText
              )
            : undefined
        ].filter(Boolean)
      )
    }

    const renderCircleProgress = () => {
      const { rest } = pickAria(attrs as Record<string, unknown>)
      const { width, height, radius, cx, cy, strokeWidth } = getCircleSize(
        props.size,
        props.strokeWidth
      )
      const { strokeDasharray, strokeDashoffset } = calculateCirclePath(
        radius,
        view.value.percentage
      )

      return h(
        'div',
        {
          ...rest,
          class: classNames(
            progressCircleBaseClasses,
            view.value.paused && 'tiger-progress-paused',
            coerceClassValue(attrs.class),
            props.className
          ),
          style: {
            ...(attrs.style as Record<string, unknown> | undefined),
            ...(props.style ?? {}),
            width: `${width}px`,
            height: `${height}px`
          },
          ...ariaProps.value
        },
        [
          h('svg', { width, height, viewBox: `0 0 ${width} ${height}`, 'aria-hidden': 'true' }, [
            h('circle', {
              cx,
              cy,
              r: radius,
              fill: 'none',
              stroke: 'currentColor',
              class: progressCircleTrackStrokeClasses,
              'stroke-width': strokeWidth
            }),
            h('circle', {
              cx,
              cy,
              r: radius,
              fill: 'none',
              stroke: 'currentColor',
              class: classNames(
                'tiger-progress-fill',
                getProgressStrokeClasses(view.value.effectiveVariant)
              ),
              'stroke-width': strokeWidth,
              'stroke-linecap': view.value.percentage === 0 ? 'butt' : 'round',
              'stroke-dasharray': strokeDasharray,
              'stroke-dashoffset': strokeDashoffset,
              style: {
                transform: 'rotate(-90deg)',
                transformOrigin: 'center'
              }
            })
          ]),
          view.value.shouldShowText
            ? h(
                'div',
                {
                  class: classNames(
                    progressCircleTextClasses,
                    progressTextSizeClasses[props.size],
                    'font-medium',
                    getProgressTextColorClasses(view.value.effectiveVariant)
                  )
                },
                view.value.displayText
              )
            : undefined
        ].filter(Boolean)
      )
    }

    return () => (props.type === 'circle' ? renderCircleProgress() : renderLineProgress())
  }
})

export default Progress
