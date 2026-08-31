import React, { forwardRef, useMemo } from 'react'
import {
  classNames,
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
  const matrix = useMemo(() => generateQRMatrix(value ?? ''), [value])
  const moduleCount = matrix.length
  const viewBox = qrViewBoxSize(moduleCount)
  const overlay = status === 'expired' || status === 'loading'
  const namedValue = value ? ` (${value})` : ''
  const imgLabel =
    status === 'expired'
      ? `${labels.expiredText}${namedValue}`
      : status === 'loading'
        ? `${labels.loadingText}${namedValue}`
        : `${labels.ariaLabel}${namedValue}`

  if (qrNeedsContrastWarning(color, bgColor)) {
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
      {...rest}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        xmlns="http://www.w3.org/2000/svg"
        role={overlay ? undefined : 'img'}
        aria-hidden={overlay ? true : undefined}
        aria-label={overlay ? undefined : imgLabel}
        className="block h-full w-full">
        <rect width={viewBox} height={viewBox} fill={bgColor} />
        {matrix.flatMap((row, r) =>
          row.map((cell, c) =>
            cell ? (
              <rect
                key={`${r}-${c}`}
                x={c + QR_QUIET_ZONE}
                y={r + QR_QUIET_ZONE}
                width={1}
                height={1}
                fill={color}
              />
            ) : null
          )
        )}
      </svg>

      {status === 'expired' ? (
        <div className={qrcodeOverlayClasses} role="status" aria-label={imgLabel}>
          <span className={qrcodeStatusTextClasses}>{labels.expiredText}</span>
          {onRefresh ? (
            <button type="button" className={qrcodeRefreshClasses} onClick={onRefresh}>
              {labels.refreshText}
            </button>
          ) : null}
        </div>
      ) : null}

      {status === 'loading' ? (
        <div className={qrcodeOverlayClasses} role="status" aria-label={imgLabel}>
          <span className={qrcodeStatusTextClasses}>{labels.loadingText}</span>
        </div>
      ) : null}
    </div>
  )
})

export default QRCode
