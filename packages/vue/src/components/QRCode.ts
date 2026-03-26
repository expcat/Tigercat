import { defineComponent, h, computed, PropType } from 'vue'
import { classNames, coerceClassValue } from '@expcat/tigercat-core'
import type { QRCodeLevel, QRCodeStatus } from '@expcat/tigercat-core'
import {
  qrcodeContainerClasses,
  qrcodeOverlayClasses,
  qrcodeExpiredTextClasses,
  qrcodeRefreshClasses,
  generateQRMatrix
} from '@expcat/tigercat-core'

export interface VueQRCodeProps {
  value: string
  size?: number
  color?: string
  bgColor?: string
  level?: QRCodeLevel
  status?: QRCodeStatus
}

export const QRCode = defineComponent({
  name: 'TigerQRCode',
  props: {
    value: { type: String, required: true },
    size: { type: Number, default: 128 },
    color: { type: String, default: '#000000' },
    bgColor: { type: String, default: '#ffffff' },
    level: { type: String as PropType<QRCodeLevel>, default: 'M' },
    status: { type: String as PropType<QRCodeStatus>, default: 'active' }
  },
  emits: ['refresh'],
  setup(props, { emit, attrs }) {
    const matrix = computed(() => generateQRMatrix(props.value))
    const moduleSize = computed(() => {
      const mLen = matrix.value.length
      return props.size! / mLen
    })

    return () => {
      const containerClass = classNames(qrcodeContainerClasses, coerceClassValue(attrs.class))
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
            h('span', { class: 'text-sm text-gray-500' }, 'Loading...')
          ])
        )
      }

      return h(
        'div',
        {
          class: containerClass,
          style: { width: `${props.size}px`, height: `${props.size}px` }
        },
        children
      )
    }
  }
})

export default QRCode
