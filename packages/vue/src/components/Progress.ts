import { defineComponent, computed, h, PropType } from 'vue';
import {
  classNames,
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
  type ProgressVariant,
  type ProgressSize,
  type ProgressType,
  type ProgressStatus,
} from '@tigercat/core';

export interface VueProgressProps {
  variant?: ProgressVariant;
  size?: ProgressSize;
  type?: ProgressType;
  percentage?: number;
  status?: ProgressStatus;
  showText?: boolean;
  text?: string;
  format?: (percentage: number) => string;
  striped?: boolean;
  stripedAnimation?: boolean;
  strokeWidth?: number;
  width?: string | number;
  height?: number;
  className?: string;
  style?: Record<string, string | number>;
}

export const Progress = defineComponent({
  name: 'TigerProgress',
  inheritAttrs: false,
  props: {
    /**
     * Progress variant style
     * @default 'primary'
     */
    variant: {
      type: String as PropType<ProgressVariant>,
      default: 'primary' as ProgressVariant,
    },
    /**
     * Progress size
     * @default 'md'
     */
    size: {
      type: String as PropType<ProgressSize>,
      default: 'md' as ProgressSize,
    },
    /**
     * Progress type (shape)
     * @default 'line'
     */
    type: {
      type: String as PropType<ProgressType>,
      default: 'line' as ProgressType,
    },
    /**
     * Current progress percentage (0-100)
     * @default 0
     */
    percentage: {
      type: Number,
      default: 0,
    },
    /**
     * Progress status
     * @default 'normal'
     */
    status: {
      type: String as PropType<ProgressStatus>,
      default: 'normal' as ProgressStatus,
    },
    /**
     * Whether to show progress text
     * @default true for line, false for circle
     */
    showText: {
      type: Boolean,
      default: undefined,
    },
    /**
     * Custom text to display
     */
    text: {
      type: String,
      default: undefined,
    },
    /**
     * Format function for custom text
     */
    format: {
      type: Function as PropType<(percentage: number) => string>,
      default: undefined,
    },
    /**
     * Whether to show striped pattern
     * @default false
     */
    striped: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether to animate stripes
     * @default false
     */
    stripedAnimation: {
      type: Boolean,
      default: false,
    },
    /**
     * Stroke width for circle type
     * @default 6
     */
    strokeWidth: {
      type: Number,
      default: 6,
    },
    /**
     * Width of progress bar
     * @default 'auto'
     */
    width: {
      type: [String, Number],
      default: 'auto',
    },
    /**
     * Height of progress bar (line type only)
     */
    height: {
      type: Number,
      default: undefined,
    },

    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined,
    },

    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    const clampedPercentage = computed(() => clampPercentage(props.percentage));

    // Render line progress
    const renderLineProgress = () => {
      const percentage = clampedPercentage.value;
      const effectiveVariant = (getStatusVariant(props.status) ||
        props.variant) as ProgressVariant;
      const shouldShowText = props.showText ?? props.type === 'line';
      const displayText = shouldShowText
        ? formatProgressText(percentage, props.text, props.format)
        : '';

      const ariaLabel = attrs['aria-label'];
      const ariaLabelledBy = attrs['aria-labelledby'];
      const ariaDescribedBy = attrs['aria-describedby'];
      const resolvedAriaLabel =
        (ariaLabel as string | undefined) ??
        (ariaLabelledBy != null ? undefined : `Progress: ${percentage}%`);

      const containerStyle =
        props.width !== 'auto'
          ? {
              width:
                typeof props.width === 'number'
                  ? `${props.width}px`
                  : props.width,
            }
          : {};

      const wrapperClasses = classNames(
        'flex items-center',
        attrs.class as any,
        props.className
      );
      const wrapperStyle = {
        ...(attrs.style as Record<string, unknown> | undefined),
        ...(props.style ?? {}),
        ...containerStyle,
      };

      const lineTrackClasses = classNames(
        progressLineBaseClasses,
        progressTrackBgClasses,
        !props.height && progressLineSizeClasses[props.size]
      );

      const trackStyle = {
        flex: 1,
        ...(props.height ? { height: `${props.height}px` } : {}),
      };

      const lineBarClasses = classNames(
        progressLineInnerClasses,
        getProgressVariantClasses(effectiveVariant),
        props.striped && progressStripedClasses,
        props.striped &&
          props.stripedAnimation &&
          progressStripedAnimationClasses
      );

      const textClasses = classNames(
        progressTextBaseClasses,
        progressTextSizeClasses[props.size],
        getProgressTextColorClasses(effectiveVariant)
      );

      return h(
        'div',
        {
          ...attrs,
          class: wrapperClasses,
          style: wrapperStyle,
        },
        [
          h('div', { class: lineTrackClasses, style: trackStyle }, [
            h('div', {
              class: lineBarClasses,
              style: { width: `${percentage}%` },
              role: 'progressbar',
              'aria-label': resolvedAriaLabel,
              'aria-labelledby': ariaLabelledBy,
              'aria-describedby': ariaDescribedBy,
              'aria-valuenow': percentage,
              'aria-valuemin': 0,
              'aria-valuemax': 100,
            }),
          ]),
          shouldShowText
            ? h('span', { class: textClasses }, displayText)
            : undefined,
        ].filter(Boolean)
      );
    };

    // Render circle progress
    const renderCircleProgress = () => {
      const percentage = clampedPercentage.value;
      const effectiveVariant = (getStatusVariant(props.status) ||
        props.variant) as ProgressVariant;
      const shouldShowText = props.showText ?? props.type === 'line';
      const displayText = shouldShowText
        ? formatProgressText(percentage, props.text, props.format)
        : '';

      const ariaLabel = attrs['aria-label'];
      const ariaLabelledBy = attrs['aria-labelledby'];
      const ariaDescribedBy = attrs['aria-describedby'];
      const resolvedAriaLabel =
        (ariaLabel as string | undefined) ??
        (ariaLabelledBy != null ? undefined : `Progress: ${percentage}%`);

      const { width, height, radius, cx, cy } = getCircleSize(
        props.size,
        props.strokeWidth
      );
      const { strokeDasharray, strokeDashoffset } = calculateCirclePath(
        radius,
        props.strokeWidth,
        percentage
      );

      const wrapperClasses = classNames(
        progressCircleBaseClasses,
        attrs.class as any,
        props.className
      );
      const wrapperStyle = {
        ...(attrs.style as Record<string, unknown> | undefined),
        ...(props.style ?? {}),
        width: `${width}px`,
        height: `${height}px`,
      };

      return h(
        'div',
        {
          ...attrs,
          class: wrapperClasses,
          style: wrapperStyle,
        },
        [
          h(
            'svg',
            {
              width,
              height,
              viewBox: `0 0 ${width} ${height}`,
            },
            [
              // Background circle
              h('circle', {
                cx,
                cy,
                r: radius,
                fill: 'none',
                stroke: 'currentColor',
                class: progressCircleTrackStrokeClasses,
                'stroke-width': props.strokeWidth,
              }),
              // Progress circle
              h('circle', {
                cx,
                cy,
                r: radius,
                fill: 'none',
                stroke: 'currentColor',
                class: getProgressVariantClasses(effectiveVariant).replace(
                  'bg-',
                  'text-'
                ),
                'stroke-width': props.strokeWidth,
                'stroke-linecap': 'round',
                'stroke-dasharray': strokeDasharray,
                'stroke-dashoffset': strokeDashoffset,
                style: {
                  transition: 'stroke-dashoffset 0.3s ease',
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center',
                },
                role: 'progressbar',
                'aria-label': resolvedAriaLabel,
                'aria-labelledby': ariaLabelledBy,
                'aria-describedby': ariaDescribedBy,
                'aria-valuenow': percentage,
                'aria-valuemin': 0,
                'aria-valuemax': 100,
              }),
            ]
          ),
          shouldShowText
            ? h(
                'div',
                {
                  class: classNames(
                    progressCircleTextClasses,
                    progressTextSizeClasses[props.size],
                    'font-medium',
                    getProgressTextColorClasses(effectiveVariant)
                  ),
                },
                displayText
              )
            : undefined,
        ].filter(Boolean)
      );
    };

    return () => {
      if (props.type === 'circle') {
        return renderCircleProgress();
      }
      return renderLineProgress();
    };
  },
});

export default Progress;
