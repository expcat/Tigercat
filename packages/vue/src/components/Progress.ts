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
  type ProgressVariant,
  type ProgressSize,
  type ProgressType,
  type ProgressStatus,
} from '@tigercat/core';

export const Progress = defineComponent({
  name: 'TigerProgress',
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
  },
  setup(props) {
    const clampedPercentage = computed(() => clampPercentage(props.percentage));

    // Determine effective variant based on status
    const effectiveVariant = computed(() => {
      const statusVariant = getStatusVariant(props.status);
      return statusVariant || props.variant;
    });

    // Determine if text should be shown
    const shouldShowText = computed(() => {
      if (props.showText !== undefined) {
        return props.showText;
      }
      return props.type === 'line';
    });

    // Get formatted text
    const displayText = computed(() => {
      if (!shouldShowText.value) {
        return '';
      }
      return formatProgressText(
        clampedPercentage.value,
        props.text,
        props.format
      );
    });

    // Line progress classes
    const lineTrackClasses = computed(() => {
      const heightClass = props.height
        ? `h-[${props.height}px]`
        : progressLineSizeClasses[props.size];

      return classNames(
        progressLineBaseClasses,
        progressTrackBgClasses,
        heightClass
      );
    });

    const lineBarClasses = computed(() => {
      return classNames(
        progressLineInnerClasses,
        getProgressVariantClasses(effectiveVariant.value as ProgressVariant),
        props.striped && progressStripedClasses,
        props.striped &&
          props.stripedAnimation &&
          progressStripedAnimationClasses
      );
    });

    const textClasses = computed(() => {
      return classNames(
        progressTextBaseClasses,
        progressTextSizeClasses[props.size],
        getProgressTextColorClasses(effectiveVariant.value as ProgressVariant)
      );
    });

    // Render line progress
    const renderLineProgress = () => {
      const containerStyle =
        props.width !== 'auto'
          ? {
              width:
                typeof props.width === 'number'
                  ? `${props.width}px`
                  : props.width,
            }
          : {};

      return h(
        'div',
        { class: 'flex items-center', style: containerStyle },
        [
          h('div', { class: lineTrackClasses.value, style: { flex: 1 } }, [
            h('div', {
              class: lineBarClasses.value,
              style: { width: `${clampedPercentage.value}%` },
              role: 'progressbar',
              'aria-label': `Progress: ${clampedPercentage.value}%`,
              'aria-valuenow': clampedPercentage.value,
              'aria-valuemin': 0,
              'aria-valuemax': 100,
            }),
          ]),
          shouldShowText.value
            ? h('span', { class: textClasses.value }, displayText.value)
            : undefined,
        ].filter(Boolean)
      );
    };

    // Render circle progress
    const renderCircleProgress = () => {
      const { width, height, radius, cx, cy } = getCircleSize(
        props.size,
        props.strokeWidth
      );
      const { strokeDasharray, strokeDashoffset } = calculateCirclePath(
        radius,
        props.strokeWidth,
        clampedPercentage.value
      );

      return h(
        'div',
        {
          class: progressCircleBaseClasses,
          style: { width: `${width}px`, height: `${height}px` },
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
                stroke: '#e5e7eb',
                'stroke-width': props.strokeWidth,
              }),
              // Progress circle
              h('circle', {
                cx,
                cy,
                r: radius,
                fill: 'none',
                stroke: 'currentColor',
                class: getProgressVariantClasses(
                  effectiveVariant.value as ProgressVariant
                ).replace('bg-', 'text-'),
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
                'aria-label': `Progress: ${clampedPercentage.value}%`,
                'aria-valuenow': clampedPercentage.value,
                'aria-valuemin': 0,
                'aria-valuemax': 100,
              }),
            ]
          ),
          shouldShowText.value
            ? h(
                'div',
                {
                  class: classNames(
                    progressCircleTextClasses,
                    progressTextSizeClasses[props.size],
                    'font-medium',
                    getProgressTextColorClasses(
                      effectiveVariant.value as ProgressVariant
                    )
                  ),
                },
                displayText.value
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
