import { defineComponent, h, computed, getCurrentInstance, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  mergeTigerLocale,
  getQRCodeLabels,
  generateQRMatrix,
  resolveQRMatrix,
  qrDarkModulesPath,
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
    const encoded = computed(() => resolveQRMatrix(props.value))

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const result = encoded.value
      const failed = !result.ok
      const modules = result.ok ? result.matrix : []
      const viewBox = qrViewBoxSize(modules.length || 1)
      const overlay = failed || props.status === 'expired' || props.status === 'loading'
      const statusText = failed
        ? labels.value.errorText
        : props.status === 'expired'
          ? labels.value.expiredText
          : props.status === 'loading'
            ? labels.value.loadingText
            : ''
      const imgLabel = statusText
        ? `${labels.value.ariaLabel}, ${statusText}`
        : labels.value.ariaLabel
      const scheme = config.value.colorScheme === 'dark' ? 'dark' : 'light'

      if (qrNeedsContrastWarning(props.color, props.bgColor, scheme)) {
        devWarn(
          'QRCode.contrast',
          'QRCode: `color` and `bgColor` are under 3:1 contrast; scanners may fail.'
        )
      }

      const darkPath = result.ok ? qrDarkModulesPath(modules) : ''

      const svg = h(
        'svg',
        {
          width: props.size,
          height: props.size,
          viewBox: `0 0 ${viewBox} ${viewBox}`,
          xmlns: 'http://www.w3.org/2000/svg',
          'aria-hidden': 'true',
          class: 'block h-full w-full'
        },
        [
          h('rect', { width: viewBox, height: viewBox, fill: props.bgColor }),
          darkPath ? h('path', { d: darkPath, fill: props.color }) : null
        ]
      )

      const children: Array<ReturnType<typeof h>> = [svg]
      const hasRefresh = Boolean(getCurrentInstance()?.vnode.props?.onRefresh)

      if (failed) {
        children.push(
          h('div', { class: qrcodeOverlayClasses, role: 'status' }, [
            h('span', { class: qrcodeStatusTextClasses }, labels.value.errorText)
          ])
        )
      }

      if (!failed && props.status === 'expired') {
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
            { class: qrcodeOverlayClasses, role: 'status' },
            refreshKids
          )
        )
      }

      if (!failed && props.status === 'loading') {
        children.push(
          h('div', { class: qrcodeOverlayClasses, role: 'status' }, [
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
          }),
          role: 'img',
          'aria-label': imgLabel
        },
        children
      )
    }
  }
})

export default QRCode
