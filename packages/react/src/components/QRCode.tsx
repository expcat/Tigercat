import React, { useMemo } from 'react'
import { classNames, mergeTigerLocale, resolveLocaleText } from '@expcat/tigercat-core'
import type { QRCodeLevel, QRCodeStatus, TigerLocale } from '@expcat/tigercat-core'
import {
  qrcodeContainerClasses,
  qrcodeOverlayClasses,
  qrcodeExpiredTextClasses,
  qrcodeRefreshClasses,
  generateQRMatrix
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface QRCodeProps {
  value: string
  size?: number
  color?: string
  bgColor?: string
  level?: QRCodeLevel
  status?: QRCodeStatus
  onRefresh?: () => void
  className?: string
  locale?: Partial<TigerLocale>
}

export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 128,
  color = '#000000',
  bgColor = '#ffffff',
  level: _level = 'M',
  status = 'active',
  onRefresh,
  className,
  locale
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const matrix = useMemo(() => generateQRMatrix(value), [value])
  const moduleSize = useMemo(() => size / matrix.length, [size, matrix.length])

  const containerClass = classNames(qrcodeContainerClasses, className)
  const ariaLabel = resolveLocaleText('QR Code', mergedLocale?.qrcode?.ariaLabel)
  const expiredText = resolveLocaleText('QR code expired', mergedLocale?.qrcode?.expiredText)
  const refreshText = resolveLocaleText('Refresh', mergedLocale?.qrcode?.refreshText)
  const loadingText = resolveLocaleText(
    'Loading...',
    mergedLocale?.qrcode?.loadingText,
    mergedLocale?.common?.loadingText
  )

  return (
    <div className={containerClass} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={ariaLabel}>
        <rect width={size} height={size} fill={bgColor} />
        {matrix.flatMap((row, r) =>
          row.map((cell, c) =>
            cell ? (
              <rect
                key={`${r}-${c}`}
                x={c * moduleSize}
                y={r * moduleSize}
                width={moduleSize}
                height={moduleSize}
                fill={color}
              />
            ) : null
          )
        )}
      </svg>

      {status === 'expired' && (
        <div className={qrcodeOverlayClasses}>
          <span className={qrcodeExpiredTextClasses}>{expiredText}</span>
          <span className={qrcodeRefreshClasses} onClick={onRefresh}>
            {refreshText}
          </span>
        </div>
      )}

      {status === 'loading' && (
        <div className={qrcodeOverlayClasses}>
          <span className="text-sm text-gray-500">{loadingText}</span>
        </div>
      )}
    </div>
  )
}

export default QRCode
