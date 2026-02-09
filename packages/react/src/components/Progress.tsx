import React from 'react'
import {
  classNames,
  getProgressVariantClasses,
  getProgressTextColorClasses,
  getStatusVariant,
  formatProgressText,
  clampPercentage,
  calculateCirclePath,
  getCircleSize,
  progressLineBaseClasses,
  progressLineInnerClasses,
  progressTextBaseClasses,
  progressCircleBaseClasses,
  progressLineSizeClasses,
  progressTextSizeClasses,
  progressStripedClasses,
  progressStripedAnimationClasses,
  progressTrackBgClasses,
  progressCircleTextClasses,
  progressCircleTrackStrokeClasses,
  type ProgressProps as CoreProgressProps,
  type ProgressVariant
} from '@expcat/tigercat-core'

export interface ProgressProps
  extends CoreProgressProps, Omit<React.HTMLAttributes<HTMLDivElement>, keyof CoreProgressProps> {}

export const Progress: React.FC<ProgressProps> = ({
  variant = 'primary',
  size = 'md',
  type = 'line',
  percentage = 0,
  status = 'normal',
  showText,
  text,
  format,
  striped = false,
  stripedAnimation = false,
  strokeWidth = 6,
  width = 'auto',
  height,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  ...props
}) => {
  const clampedPercentage = clampPercentage(percentage)
  const effectiveVariant = (getStatusVariant(status) || variant) as ProgressVariant
  const shouldShowText = showText ?? type === 'line'
  const displayText = shouldShowText ? formatProgressText(clampedPercentage, text, format) : ''
  const resolvedAriaLabel =
    ariaLabel ?? (ariaLabelledby ? undefined : `Progress: ${clampedPercentage}%`)

  const ariaAttrs = {
    role: 'progressbar' as const,
    'aria-label': resolvedAriaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-valuenow': clampedPercentage,
    'aria-valuemin': 0,
    'aria-valuemax': 100
  }

  const renderLineProgress = () => {
    const containerStyle =
      width !== 'auto' ? { width: typeof width === 'number' ? `${width}px` : width } : {}

    return (
      <div
        {...props}
        className={classNames('flex items-center w-full', className)}
        style={{ ...(style ?? {}), ...containerStyle }}>
        <div
          className={classNames(
            progressLineBaseClasses,
            progressTrackBgClasses,
            !height && progressLineSizeClasses[size]
          )}
          style={{ flex: 1, ...(height ? { height: `${height}px` } : {}) }}>
          <div
            className={classNames(
              progressLineInnerClasses,
              getProgressVariantClasses(effectiveVariant),
              striped && progressStripedClasses,
              striped && stripedAnimation && progressStripedAnimationClasses
            )}
            style={{ width: `${clampedPercentage}%` }}
            {...ariaAttrs}
          />
        </div>
        {shouldShowText && (
          <span
            className={classNames(
              progressTextBaseClasses,
              progressTextSizeClasses[size],
              getProgressTextColorClasses(effectiveVariant)
            )}>
            {displayText}
          </span>
        )}
      </div>
    )
  }

  const renderCircleProgress = () => {
    const { width: svgWidth, height: svgHeight, radius, cx, cy } = getCircleSize(size, strokeWidth)
    const { strokeDasharray, strokeDashoffset } = calculateCirclePath(radius, clampedPercentage)

    return (
      <div
        {...props}
        className={classNames(progressCircleBaseClasses, className)}
        style={{
          ...(style ?? {}),
          width: `${svgWidth}px`,
          height: `${svgHeight}px`
        }}>
        <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="currentColor"
            className={progressCircleTrackStrokeClasses}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="currentColor"
            className={getProgressVariantClasses(effectiveVariant).replace('bg-', 'text-')}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.3s ease',
              transform: 'rotate(-90deg)',
              transformOrigin: 'center'
            }}
            {...ariaAttrs}
          />
        </svg>
        {shouldShowText && (
          <div
            className={classNames(
              progressCircleTextClasses,
              progressTextSizeClasses[size],
              'font-medium',
              getProgressTextColorClasses(effectiveVariant)
            )}>
            {displayText}
          </div>
        )}
      </div>
    )
  }

  if (type === 'circle') return renderCircleProgress()
  return renderLineProgress()
}
