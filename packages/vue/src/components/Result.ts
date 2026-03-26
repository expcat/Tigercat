import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  resultBaseClasses,
  resultIconContainerBaseClasses,
  resultIconClasses,
  resultTitleClasses,
  resultSubTitleClasses,
  resultExtraClasses,
  getResultColorScheme,
  getResultIconPath,
  getResultHttpLabel,
  type ResultStatus
} from '@expcat/tigercat-core'
import { createStatusIcon } from '../utils/icon-helpers'

export interface VueResultProps {
  status?: ResultStatus
  title?: string
  subTitle?: string
  className?: string
  style?: Record<string, string | number>
}

export const Result = defineComponent({
  name: 'TigerResult',
  inheritAttrs: false,
  props: {
    status: {
      type: String as PropType<ResultStatus>,
      default: 'info' as ResultStatus
    },
    title: {
      type: String,
      default: undefined
    },
    subTitle: {
      type: String,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const colors = computed(() => getResultColorScheme(props.status))
    const iconPath = computed(() => getResultIconPath(props.status))
    const httpLabel = computed(() => getResultHttpLabel(props.status))

    const iconContainerClasses = computed(() =>
      classNames(resultIconContainerBaseClasses, colors.value.iconBg)
    )

    const iconSvgClasses = computed(() => classNames(resultIconClasses, colors.value.iconColor))

    const titleCls = computed(() => classNames(resultTitleClasses, colors.value.titleColor))

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const children = []

      // Icon area
      if (slots.icon) {
        children.push(h('div', { class: iconContainerClasses.value }, slots.icon()))
      } else {
        const iconContent = []

        if (httpLabel.value) {
          iconContent.push(
            h(
              'span',
              {
                class: classNames('text-5xl font-bold', colors.value.iconColor)
              },
              httpLabel.value
            )
          )
        } else {
          iconContent.push(createStatusIcon(iconPath.value, iconSvgClasses.value))
        }

        children.push(h('div', { class: iconContainerClasses.value }, iconContent))
      }

      // Title
      if (props.title || slots.title) {
        children.push(
          h('div', { class: titleCls.value }, slots.title ? slots.title() : props.title)
        )
      }

      // SubTitle
      if (props.subTitle || slots.subTitle) {
        children.push(
          h(
            'div',
            { class: resultSubTitleClasses },
            slots.subTitle ? slots.subTitle() : props.subTitle
          )
        )
      }

      // Extra content (actions)
      if (slots.extra) {
        children.push(h('div', { class: resultExtraClasses }, slots.extra()))
      }

      // Default slot (body content below extra)
      if (slots.default) {
        children.push(h('div', { class: 'mt-6 w-full' }, slots.default()))
      }

      return h(
        'div',
        {
          ...attrs,
          class: classNames(
            resultBaseClasses,
            props.className,
            coerceClassValue(attrsRecord.class)
          ),
          style: mergeStyleValues(attrsRecord.style, props.style),
          role: 'status'
        },
        children
      )
    }
  }
})

export default Result
