import { defineComponent, h, computed, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  resolveLocaleText,
  mergeTigerLocale
} from '@expcat/tigercat-core'
import type { QRCodeLevel, QRCodeStatus, TigerLocale } from '@expcat/tigercat-core'
import {
  qrcodeContainerClasses,
  qrcodeOverlayClasses,
  qrcodeExpiredTextClasses,
  qrcodeRefreshClasses,
  generateQRMatrix
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueQRCodeProps {
  value: string
  size?: number
  color?: string
  bgColor?: string
  level?: QRCodeLevel
  status?: QRCodeStatus
  className?: string
  locale?: Partial<TigerLocale>
}

export const QRCode = defineComponent({
  name: 'TigerQRCode',
  inheritAttrs: false,
  props: {
    value: { type: String, required: true },
    size: { type: Number, default: 128 },
    color: { type: String, default: '#000000' },
    bgColor: { type: String, default: '#ffffff' },
    level: { type: String as PropType<QRCodeLevel>, default: 'M' },
    status: { type: String as PropType<QRCodeStatus>, default: 'active' },
    className: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined }
  },
  emits: ['refresh'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const matrix = computed(() => generateQRMatrix(props.value))
    const moduleSize = computed(() => {
      const mLen = matrix.value.length
      return (props.size ?? 128) / mLen
    })

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const containerClass = classNames(
        qrcodeContainerClasses,
        props.className,
        coerceClassValue(attrsRecord.class)
      )
      const mSize = moduleSize.value
      const modules = matrix.value

      const rects = modules.flatMap((row, r) =>
        row
          .map((cell, c) =>
            cell
              ? h('rect', {
                  key: `${r}-${c}`,
                  x: c * mSize,
                  y: r * mSize,
                  width: mSize,
                  height: mSize,
                  fill: props.color
                })
              : null
          )
          .filter(Boolean)
      )

      const svg = h(
        'svg',
        {
          width: props.size,
          height: props.size,
          viewBox: `0 0 ${props.size} ${props.size}`,
          xmlns: 'http://www.w3.org/2000/svg',
          role: 'img',
          'aria-label': 'QR Code'
        },
        [h('rect', { width: props.size, height: props.size, fill: props.bgColor }), ...rects]
      )

      const children: Array<ReturnType<typeof h>> = [svg]

      if (props.status === 'expired') {
        children.push(
          h('div', { class: qrcodeOverlayClasses }, [
            h('span', { class: qrcodeExpiredTextClasses }, 'QR code expired'),
            h(
              'span',
              {
                class: qrcodeRefreshClasses,
                onClick: () => emit('refresh')
              },
              'Refresh'
            )
          ])
        )
      }

      if (props.status === 'loading') {
        children.push(
          h('div', { class: qrcodeOverlayClasses }, [
            h(
              'span',
              { class: 'text-sm text-gray-500' },
              resolveLocaleText('Loading...', mergedLocale.value?.common?.loadingText)
            )
          ])
        )
      }

      return h(
        'div',
        {
          ...attrs,
          class: containerClass,
          style: mergeStyleValues(attrsRecord.style, {
            width: `${props.size}px`,
            height: `${props.size}px`
          })
        },
        children
      )
    }
  }
})

export default QRCode
