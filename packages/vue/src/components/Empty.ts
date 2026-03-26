import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  emptyBaseClasses,
  emptyImageClasses,
  emptyDescriptionClasses,
  emptyActionsClasses,
  emptyIllustrationViewBox,
  emptyIllustrationPaths,
  getEmptyDescription,
  type EmptyPreset
} from '@expcat/tigercat-core'

export interface VueEmptyProps {
  preset?: EmptyPreset
  description?: string
  showImage?: boolean
  className?: string
  style?: Record<string, string | number>
}

export const Empty = defineComponent({
  name: 'TigerEmpty',
  inheritAttrs: false,
  props: {
    preset: {
      type: String as PropType<EmptyPreset>,
      default: 'default' as EmptyPreset
    },
    description: {
      type: String,
      default: undefined
    },
    showImage: {
      type: Boolean,
      default: true
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
    const descText = computed(() => props.description ?? getEmptyDescription(props.preset))

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const children = []

      // Image / illustration
      if (props.showImage) {
        if (slots.image) {
          children.push(h('div', { class: emptyImageClasses }, slots.image()))
        } else {
          const paths = emptyIllustrationPaths.map((p, i) =>
            h('path', {
              key: i,
              d: p.d,
              fill: p.fill ?? 'none',
              stroke: p.stroke,
              'stroke-width': p.strokeWidth,
              opacity: p.opacity
            })
          )
          children.push(
            h('div', { class: emptyImageClasses }, [
              h(
                'svg',
                {
                  xmlns: 'http://www.w3.org/2000/svg',
                  viewBox: emptyIllustrationViewBox,
                  class: 'mx-auto h-24 w-24'
                },
                paths
              )
            ])
          )
        }
      }

      // Description
      if (slots.description || descText.value) {
        children.push(
          h(
            'div',
            { class: emptyDescriptionClasses },
            slots.description ? slots.description() : descText.value
          )
        )
      }

      // Actions slot
      if (slots.extra) {
        children.push(h('div', { class: emptyActionsClasses }, slots.extra()))
      }

      // Default slot (arbitrary content)
      if (slots.default) {
        children.push(h('div', null, slots.default()))
      }

      return h(
        'div',
        {
          ...attrs,
          class: classNames(emptyBaseClasses, props.className, coerceClassValue(attrsRecord.class)),
          style: mergeStyleValues(attrsRecord.style, props.style)
        },
        children
      )
    }
  }
})

export default Empty
