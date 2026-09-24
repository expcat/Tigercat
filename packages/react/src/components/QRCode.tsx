import React, { forwardRef, useMemo } from 'react'
import {
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
  extends CoreQRCodeProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  onRefresh?: () => void
}

export const QRCode = forwardRef<HTMLDivElement, QRCodeProps>(function QRCode(
  {
    value,
    size = 128,
    color = QRCODE_DEFAULT_COLOR,
    bgColor = QRCODE_DEFAULT_BG,
    status = 'active',
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
  const encoded = useMemo(() => resolveQRMatrix(value), [value])
  const failed = !encoded.ok
  const matrix = encoded.ok ? encoded.matrix : []
  const viewBox = qrViewBoxSize(matrix.length || 1)
  const statusText = failed
    ? labels.errorText
    : status === 'expired'
      ? labels.expiredText
      : status === 'loading'
        ? labels.loadingText
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
      </svg>

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

      {!failed && status === 'loading' ? (
        <div className={qrcodeOverlayClasses} role="status">
          <span className={qrcodeStatusTextClasses}>{labels.loadingText}</span>
        </div>
      ) : null}
    </div>
  )
})

export default QRCode
