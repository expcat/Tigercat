import {
  defineComponent,
  computed,
  h,
  PropType,
  ref,
  watch,
  onUnmounted,
} from 'vue';
import {
  classNames,
  coerceClassValue,
  getLoadingBarClasses,
  getLoadingBarsWrapperClasses,
  getLoadingClasses,
  getLoadingDotClasses,
  getLoadingDotsWrapperClasses,
  getLoadingTextClasses,
  getSpinnerSVG,
  loadingContainerBaseClasses,
  loadingFullscreenBaseClasses,
  loadingColorClasses,
  mergeStyleValues,
  normalizeSvgAttrs,
  injectLoadingAnimationStyles,
  type LoadingVariant,
  type LoadingSize,
  type LoadingColor,
} from '@tigercat/core';

export interface VueLoadingProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  color?: LoadingColor;
  text?: string;
  fullscreen?: boolean;
  delay?: number;
  background?: string;
  customColor?: string;
  className?: string;
  style?: Record<string, string | number>;
}

export const Loading = defineComponent({
  name: 'TigerLoading',
  inheritAttrs: false,
  props: {
    /**
     * Loading spinner variant - determines animation style
     * @default 'spinner'
     */
    variant: {
      type: String as PropType<LoadingVariant>,
      default: 'spinner' as LoadingVariant,
    },
    /**
     * Size of the loading indicator
     * @default 'md'
     */
    size: {
      type: String as PropType<LoadingSize>,
      default: 'md' as LoadingSize,
    },
    /**
     * Color variant
     * @default 'primary'
     */
    color: {
      type: String as PropType<LoadingColor>,
      default: 'primary' as LoadingColor,
    },
    /**
     * Custom text to display below the spinner
     */
    text: {
      type: String,
      default: undefined,
    },
    /**
     * Whether to show loading as fullscreen overlay
     * @default false
     */
    fullscreen: {
      type: Boolean,
      default: false,
    },
    /**
     * Delay before showing the loading indicator (ms)
     * @default 0
     */
    delay: {
      type: Number,
      default: 0,
    },
    /**
     * Custom background color (for fullscreen mode)
     * @default 'rgba(255, 255, 255, 0.9)'
     */
    background: {
      type: String,
      default: 'rgba(255, 255, 255, 0.9)',
    },
    /**
     * Custom spinner color (overrides color variant)
     */
    customColor: {
      type: String,
      default: undefined,
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: '',
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
    // Inject animation styles when component is first used
    injectLoadingAnimationStyles();

    const visible = ref(false);
    let timer: ReturnType<typeof setTimeout> | null = null;

    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    watch(
      () => props.delay,
      (delay) => {
        clearTimer();

        if (delay <= 0) {
          visible.value = true;
          return;
        }

        visible.value = false;
        timer = setTimeout(() => {
          visible.value = true;
        }, delay);
      },
      { immediate: true }
    );

    onUnmounted(() => {
      clearTimer();
    });

    const spinnerClasses = computed(() => {
      return getLoadingClasses(
        props.variant,
        props.size,
        props.color,
        props.customColor
      );
    });

    const textClasses = computed(() => {
      return getLoadingTextClasses(props.size, props.color, props.customColor);
    });

    const containerClasses = computed(() => {
      return classNames(
        props.fullscreen
          ? loadingFullscreenBaseClasses
          : loadingContainerBaseClasses,
        props.className,
        coerceClassValue(attrs.class)
      );
    });

    const customStyle = computed(() => {
      const baseStyle: Record<string, string | number> = {};

      if (props.customColor) {
        baseStyle.color = props.customColor;
      }

      if (props.fullscreen) {
        baseStyle.backgroundColor = props.background;
      }

      return mergeStyleValues(attrs.style, props.style, baseStyle);
    });

    // Render spinner variant
    const renderSpinner = () => {
      const svg = getSpinnerSVG(props.variant);

      return h(
        'svg',
        {
          class: spinnerClasses.value,
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: svg.viewBox,
        },
        svg.elements.map((el) => h(el.type, normalizeSvgAttrs(el.attrs)))
      );
    };

    // Render dots variant
    const renderDots = () => {
      const colorClass = props.customColor
        ? ''
        : loadingColorClasses[props.color];
      const steps = [0, 1, 2] as const;

      return h(
        'div',
        {
          class: getLoadingDotsWrapperClasses(props.size),
        },
        steps.map((i) =>
          h('div', {
            class: getLoadingDotClasses(props.size, i, colorClass),
          })
        )
      );
    };

    // Render bars variant
    const renderBars = () => {
      const colorClass = props.customColor
        ? ''
        : loadingColorClasses[props.color];
      const steps = [0, 1, 2] as const;

      return h(
        'div',
        {
          class: getLoadingBarsWrapperClasses(props.size),
        },
        steps.map((i) =>
          h('div', {
            class: getLoadingBarClasses(props.size, i, colorClass),
          })
        )
      );
    };

    // Render loading indicator based on variant
    const renderIndicator = () => {
      switch (props.variant) {
        case 'dots':
          return renderDots();
        case 'bars':
          return renderBars();
        case 'spinner':
        case 'ring':
        case 'pulse':
        default:
          return renderSpinner();
      }
    };

    return () => {
      if (!visible.value) {
        return null;
      }

      const children = [renderIndicator()];

      if (props.text) {
        children.push(h('div', { class: textClasses.value }, props.text));
      }

      return h(
        'div',
        {
          role: 'status',
          'aria-label': props.text || 'Loading',
          'aria-live': 'polite',
          'aria-busy': true,
          ...attrs,
          class: containerClasses.value,
          style: customStyle.value,
        },
        children
      );
    };
  },
});

export default Loading;
