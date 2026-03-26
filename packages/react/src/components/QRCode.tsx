import React, { useMemo } from 'react'
import { classNames } from '@expcat/tigercat-core'
import type { QRCodeLevel, QRCodeStatus } from '@expcat/tigercat-core'
import {
  qrcodeContainerClasses,
  qrcodeOverlayClasses,
  qrcodeExpiredTextClasses,
  qrcodeRefreshClasses,
  generateQRMatrix
} from '@expcat/tigercat-core'

export interface QRCodeProps {
  value: string
  size?: number
  color?: string
  bgColor?: string
  level?: QRCodeLevel
  status?: QRCodeStatus
  onRefresh?: () => void
  className?: string
}

export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 128,
  color = '#000000',
  bgColor = '#ffffff',
  level = 'M',
  status = 'active',
  onRefresh,
  className
}) => {
  const matrix = useMemo(() => generateQRMatrix(value), [value])
  const moduleSize = useMemo(() => size / matrix.length, [size, matrix.length])

  const containerClass = classNames(qrcodeContainerClasses, className)

  return (
    <div className={containerClass} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="QR Code">
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
          <span className={qrcodeExpiredTextClasses}>QR code expired</span>
          <span className={qrcodeRefreshClasses} onClick={onRefresh}>
            Refresh
          </span>
        </div>
      )}

      {status === 'loading' && (
        <div className={qrcodeOverlayClasses}>
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      )}
    </div>
  )
}

export default QRCode
