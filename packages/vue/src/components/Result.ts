import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  resultBaseClasses,
  resultIconContainerBaseClasses,
  resultIconClasses,
  resultHttpLabelClasses,
  resultTitleClasses,
  resultSubTitleClasses,
  resultExtraClasses,
  RESULT_ICON_SIZE_PX,
  getResultColorScheme,
  getResultIconPath,
  isHttpResultStatus,
  resultHeadingTag,
  type ResultHeadingLevel,
  type ResultStatus
} from '@expcat/tigercat-core'
import { createStatusIcon } from '../utils/icon-helpers'

export interface VueResultProps {
  status?: ResultStatus
  title?: string
  subTitle?: string
  headingLevel?: ResultHeadingLevel
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
    headingLevel: {
      type: Number as PropType<ResultHeadingLevel>,
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
    const httpLabel = computed(() => (isHttpResultStatus(props.status) ? props.status : undefined))
    const headingTag = computed(() => resultHeadingTag(props.headingLevel))

    const iconSvgClasses = computed(() => classNames(resultIconClasses, colors.value.iconColor))

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const children = []
      const hasTitle = Boolean(props.title || slots.title)

      if (slots.icon) {
        children.push(
          h(
            'div',
            {
              class: resultIconContainerBaseClasses,
              style: {
                width: `${RESULT_ICON_SIZE_PX}px`,
                height: `${RESULT_ICON_SIZE_PX}px`,
                background: colors.value.iconBg
              }
            },
            slots.icon()
          )
        )
      } else {
        const iconContent = []

        if (httpLabel.value) {
          iconContent.push(
            h(
              'span',
              {
                class: classNames(resultHttpLabelClasses, colors.value.iconColor),
                'aria-hidden': hasTitle ? 'true' : undefined
              },
              httpLabel.value
            )
          )
        } else {
          iconContent.push(
            createStatusIcon(iconPath.value, iconSvgClasses.value, {
              'aria-hidden': 'true',
              focusable: 'false'
            })
          )
        }

        children.push(
          h(
            'div',
            {
              class: resultIconContainerBaseClasses,
              style: {
                width: `${RESULT_ICON_SIZE_PX}px`,
                height: `${RESULT_ICON_SIZE_PX}px`,
                background: colors.value.iconBg
              }
            },
            iconContent
          )
        )
      }

      if (hasTitle) {
        children.push(
          h(
            headingTag.value,
            { class: resultTitleClasses },
            slots.title ? slots.title() : props.title
          )
        )
      }

      if (props.subTitle || slots.subTitle) {
        children.push(
          h(
            'div',
            { class: resultSubTitleClasses },
            slots.subTitle ? slots.subTitle() : props.subTitle
          )
        )
      }

      if (slots.extra) {
        children.push(h('div', { class: resultExtraClasses }, slots.extra()))
      }

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
          style: mergeStyleValues(attrsRecord.style, props.style)
        },
        children
      )
    }
  }
})

export default Result
