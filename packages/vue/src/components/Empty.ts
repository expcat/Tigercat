import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  emptyBaseClasses,
  emptyImageClasses,
  emptyDescriptionClasses,
  emptyActionsClasses,
  getEmptyDescription,
  getEmptyIllustration,
  resolveEmptyImageMode,
  mergeTigerLocale,
  devWarn,
  type TigerLocale,
  type EmptyPreset
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueEmptyProps {
  preset?: EmptyPreset
  description?: string
  showImage?: boolean
  locale?: Partial<TigerLocale>
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
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const descText = computed(
      () => props.description ?? getEmptyDescription(props.preset, mergedLocale.value)
    )

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const hasCustomImage = Boolean(slots.image)
      const imageMode = resolveEmptyImageMode({
        showImage: props.showImage,
        hasCustomImage,
        preset: props.preset
      })
      const illustration = imageMode === 'builtin' ? getEmptyIllustration(props.preset) : null

      if (props.showImage === false && hasCustomImage) {
        devWarn(
          'Empty.showImage.custom',
          'Empty: the image slot still renders when `showImage` is false. Omit the slot to hide the illustration.'
        )
      }

      const children = []

      if (imageMode === 'custom' && slots.image) {
        children.push(h('div', { class: emptyImageClasses || undefined }, slots.image()))
      } else if (illustration) {
        const paths = illustration.paths.map((p, i) =>
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
          h('div', { class: emptyImageClasses || undefined }, [
            h(
              'svg',
              {
                xmlns: 'http://www.w3.org/2000/svg',
                viewBox: illustration.viewBox,
                class: 'mx-auto h-24 w-24',
                'aria-hidden': 'true',
                focusable: 'false'
              },
              paths
            )
          ])
        )
      }

      if (slots.description || descText.value) {
        children.push(
          h(
            'div',
            { class: emptyDescriptionClasses },
            slots.description ? slots.description() : descText.value
          )
        )
      }

      if (slots.extra) {
        children.push(h('div', { class: emptyActionsClasses }, slots.extra()))
      }

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
