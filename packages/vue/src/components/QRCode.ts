import { defineComponent, h, computed, getCurrentInstance, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  mergeTigerLocale,
  getQRCodeLabels,
  generateQRMatrix,
  qrcodeContainerClasses,
  qrcodeOverlayClasses,
  qrcodeStatusTextClasses,
  qrcodeRefreshClasses,
  QRCODE_DEFAULT_COLOR,
  QRCODE_DEFAULT_BG,
  QR_QUIET_ZONE,
  qrViewBoxSize,
  qrNeedsContrastWarning,
  devWarn,
  type QRCodeStatus,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueQRCodeProps {
  value: string
  size?: number
  color?: string
  bgColor?: string
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
    color: { type: String, default: QRCODE_DEFAULT_COLOR },
    bgColor: { type: String, default: QRCODE_DEFAULT_BG },
    status: { type: String as PropType<QRCodeStatus>, default: 'active' as QRCodeStatus },
    className: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined }
  },
  emits: ['refresh'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getQRCodeLabels(mergedLocale.value))
    const matrix = computed(() => generateQRMatrix(props.value ?? ''))

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const modules = matrix.value
      const viewBox = qrViewBoxSize(modules.length)
      const overlay = props.status === 'expired' || props.status === 'loading'
      const namedValue = props.value ? ` (${props.value})` : ''
      const imgLabel =
        props.status === 'expired'
          ? `${labels.value.expiredText}${namedValue}`
          : props.status === 'loading'
            ? `${labels.value.loadingText}${namedValue}`
            : `${labels.value.ariaLabel}${namedValue}`

      if (qrNeedsContrastWarning(props.color, props.bgColor)) {
        devWarn(
          'QRCode.contrast',
          'QRCode: `color` and `bgColor` are under 3:1 contrast; scanners may fail.'
        )
      }

      const rects = modules.flatMap((row, r) =>
        row
          .map((cell, c) =>
            cell
              ? h('rect', {
                  key: `${r}-${c}`,
                  x: c + QR_QUIET_ZONE,
                  y: r + QR_QUIET_ZONE,
                  width: 1,
                  height: 1,
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
          viewBox: `0 0 ${viewBox} ${viewBox}`,
          xmlns: 'http://www.w3.org/2000/svg',
          role: overlay ? undefined : 'img',
          'aria-hidden': overlay ? 'true' : undefined,
          'aria-label': overlay ? undefined : imgLabel,
          class: 'block h-full w-full'
        },
        [h('rect', { width: viewBox, height: viewBox, fill: props.bgColor }), ...rects]
      )

      const children: Array<ReturnType<typeof h>> = [svg]
      const hasRefresh = Boolean(getCurrentInstance()?.vnode.props?.onRefresh)

      if (props.status === 'expired') {
        const refreshKids = [
          h('span', { class: qrcodeStatusTextClasses }, labels.value.expiredText)
        ]
        if (hasRefresh) {
          refreshKids.push(
            h(
              'button',
              {
                type: 'button',
                class: qrcodeRefreshClasses,
                onClick: () => emit('refresh')
              },
              labels.value.refreshText
            )
          )
        }
        children.push(
          h(
            'div',
            { class: qrcodeOverlayClasses, role: 'status', 'aria-label': imgLabel },
            refreshKids
          )
        )
      }

      if (props.status === 'loading') {
        children.push(
          h('div', { class: qrcodeOverlayClasses, role: 'status', 'aria-label': imgLabel }, [
            h('span', { class: qrcodeStatusTextClasses }, labels.value.loadingText)
          ])
        )
      }

      return h(
        'div',
        {
          ...attrs,
          class: classNames(
            qrcodeContainerClasses,
            props.className,
            coerceClassValue(attrsRecord.class)
          ),
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
