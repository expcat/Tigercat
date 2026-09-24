import React, { forwardRef, useMemo } from 'react'
import {
  basicLabel,
  classNames,
  mergeTigerLocale,
  getQRCodeLabels,
  resolveQRMatrix,
  qrDarkModulesPath,
  qrcodeContainerClasses,
  qrcodeOverlayClasses,
  qrcodeStatusTextClasses,
  qrcodeRefreshClasses,
  QRCODE_DEFAULT_COLOR,
  QRCODE_DEFAULT_BG,
  qrViewBoxSize,
  qrNeedsContrastWarning,
  devWarn,
  type QRCodeProps as CoreQRCodeProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface QRCodeProps
  extends Omit<CoreQRCodeProps, 'icon'>, Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  onRefresh?: () => void
  /** SVG path data, or a center icon node. The matrix is left intact. */
  icon?: string | React.ReactNode
}

export const QRCode = forwardRef<HTMLDivElement, QRCodeProps>(function QRCode(
  {
    value,
    size = 128,
    color = QRCODE_DEFAULT_COLOR,
    bgColor = QRCODE_DEFAULT_BG,
    status = 'active',
    errorLevel = 'M',
    icon,
    onRefresh,
    className,
    locale,
    style,
    ...rest
  },
  ref
) {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(() => getQRCodeLabels(mergedLocale), [mergedLocale])
  const encoded = useMemo(() => resolveQRMatrix(value, errorLevel), [value, errorLevel])
  const failed = !encoded.ok
  const matrix = encoded.ok ? encoded.matrix : []
  const viewBox = qrViewBoxSize(matrix.length || 1)
  const scannedText = basicLabel(mergedLocale.locale, 'qrcode', 'scanned')
  const iconPath = typeof icon === 'string' ? icon : undefined
  const iconNode = typeof icon === 'string' ? null : icon
  const statusText = failed
    ? labels.errorText
    : status === 'expired'
      ? labels.expiredText
      : status === 'loading'
        ? labels.loadingText
        : status === 'scanned'
          ? scannedText
          : ''
  const imgLabel = statusText ? `${labels.ariaLabel}, ${statusText}` : labels.ariaLabel
  const scheme = config.colorScheme === 'dark' ? 'dark' : 'light'

  if (qrNeedsContrastWarning(color, bgColor, scheme)) {
    devWarn(
      'QRCode.contrast',
      'QRCode: `color` and `bgColor` are under 3:1 contrast; scanners may fail.'
    )
  }

  return (
    <div
      ref={ref}
      className={classNames(qrcodeContainerClasses, className)}
      style={{ ...style, width: size, height: size }}
      {...rest}
      role="img"
      aria-label={imgLabel}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="block h-full w-full">
        <rect width={viewBox} height={viewBox} fill={bgColor} />
        {encoded.ok ? <path d={qrDarkModulesPath(matrix)} fill={color} /> : null}
        {iconPath ? (
          <path
            d={iconPath}
            fill={color}
            transform={`translate(${viewBox / 2 - 3} ${viewBox / 2 - 3}) scale(${6 / 24})`}
          />
        ) : null}
      </svg>
      {iconNode ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true">
          {iconNode}
        </div>
      ) : null}

      {failed ? (
        <div className={qrcodeOverlayClasses} role="status">
          <span className={qrcodeStatusTextClasses}>{labels.errorText}</span>
        </div>
      ) : null}

      {!failed && status === 'expired' ? (
        <div className={qrcodeOverlayClasses} role="status">
          <span className={qrcodeStatusTextClasses}>{labels.expiredText}</span>
          {onRefresh ? (
            <button type="button" className={qrcodeRefreshClasses} onClick={onRefresh}>
              {labels.refreshText}
            </button>
          ) : null}
        </div>
      ) : null}

      {!failed && status === 'scanned' ? (
        <div className={qrcodeOverlayClasses} role="status">
          <span className={qrcodeStatusTextClasses}>{scannedText}</span>
        </div>
      ) : null}

      {!failed && status === 'loading' ? (
        <div className={qrcodeOverlayClasses} role="status">
          <span className={qrcodeStatusTextClasses}>{labels.loadingText}</span>
        </div>
      ) : null}
    </div>
  )
})

export default QRCode
