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
  basicLabel,
  QR_QUIET_ZONE,
  qrViewBoxSize,
  qrNeedsContrastWarning,
  devWarn,
  type QRCodeErrorLevel,
  type QRCodeStatus,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'

export interface VueQRCodeProps {
  value: string
  size?: number
  color?: string
  bgColor?: string
  status?: QRCodeStatus
  errorLevel?: QRCodeErrorLevel
  icon?: string
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
    errorLevel: { type: String as PropType<QRCodeErrorLevel>, default: 'M' },
    icon: { type: String, default: undefined },
    className: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined }
  },
  emits: ['refresh'],
  setup(props, { emit, attrs, slots }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getQRCodeLabels(mergedLocale.value))
    const encoded = computed(() => resolveQRMatrix(props.value, props.errorLevel))

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const result = encoded.value
      const failed = !result.ok
      const modules = result.ok ? result.matrix : []
      const viewBox = qrViewBoxSize(modules.length || 1)
      const overlay = failed || props.status === 'expired' || props.status === 'loading'
      const scannedText = basicLabel(mergedLocale.value?.locale, 'qrcode', 'scanned')
      const statusText = failed
        ? labels.value.errorText
        : props.status === 'expired'
          ? labels.value.expiredText
          : props.status === 'loading'
            ? labels.value.loadingText
            : props.status === 'scanned'
              ? scannedText
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
          darkPath ? h('path', { d: darkPath, fill: props.color }) : null,
          props.icon && !slots.icon
            ? h('path', {
                d: props.icon,
                fill: props.color,
                transform: `translate(${viewBox / 2 - 3} ${viewBox / 2 - 3}) scale(${6 / 24})`
              })
            : null
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
        children.push(h('div', { class: qrcodeOverlayClasses, role: 'status' }, refreshKids))
      }

      if (slots.icon) {
        children.push(
          h(
            'div',
            {
              class: 'pointer-events-none absolute inset-0 flex items-center justify-center',
              'aria-hidden': 'true'
            },
            slots.icon()
          )
        )
      }

      if (!failed && props.status === 'scanned') {
        children.push(
          h('div', { class: qrcodeOverlayClasses, role: 'status' }, [
            h('span', { class: qrcodeStatusTextClasses }, scannedText)
          ])
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
