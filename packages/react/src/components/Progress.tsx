import React, { useMemo } from 'react'
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
  type ProgressProps as CoreProgressProps,
  type ProgressVariant,
} from '@tigercat/core'

export interface ProgressProps extends CoreProgressProps {
  /**
   * Additional props
   */
  [key: string]: any
}

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
  ...props
}) => {
  const clampedPercentage = useMemo(() => clampPercentage(percentage), [percentage])
  
  // Determine effective variant based on status
  const effectiveVariant = useMemo(() => {
    const statusVariant = getStatusVariant(status)
    return (statusVariant || variant) as ProgressVariant
  }, [status, variant])
  
  // Determine if text should be shown
  const shouldShowText = useMemo(() => {
    if (showText !== undefined) {
      return showText
    }
    return type === 'line'
  }, [showText, type])
  
  // Get formatted text
  const displayText = useMemo(() => {
    if (!shouldShowText) {
      return ''
    }
    return formatProgressText(clampedPercentage, text, format)
  }, [shouldShowText, clampedPercentage, text, format])
  
  // Line progress classes
  const lineTrackClasses = useMemo(() => {
    const heightClass = height 
      ? `h-[${height}px]`
      : progressLineSizeClasses[size]
    
    return classNames(
      progressLineBaseClasses,
      progressTrackBgClasses,
      heightClass
    )
  }, [size, height])
  
  const lineBarClasses = useMemo(() => {
    return classNames(
      progressLineInnerClasses,
      getProgressVariantClasses(effectiveVariant),
      striped && progressStripedClasses,
      striped && stripedAnimation && progressStripedAnimationClasses
    )
  }, [effectiveVariant, striped, stripedAnimation])
  
  const textClasses = useMemo(() => {
    return classNames(
      progressTextBaseClasses,
      progressTextSizeClasses[size],
      getProgressTextColorClasses(effectiveVariant)
    )
  }, [size, effectiveVariant])
  
  // Render line progress
  const renderLineProgress = () => {
    const containerStyle = width !== 'auto'
      ? { width: typeof width === 'number' ? `${width}px` : width }
      : {}
    
    return (
      <div className={classNames('flex items-center', className)} style={containerStyle} {...props}>
        <div className={lineTrackClasses} style={{ flex: 1 }}>
          <div
            className={lineBarClasses}
            style={{ width: `${clampedPercentage}%` }}
            role="progressbar"
            aria-label={`Progress: ${clampedPercentage}%`}
            aria-valuenow={clampedPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        {shouldShowText && (
          <span className={textClasses}>{displayText}</span>
        )}
      </div>
    )
  }
  
  // Render circle progress
  const renderCircleProgress = () => {
    const { width: svgWidth, height: svgHeight, radius, cx, cy } = getCircleSize(size, strokeWidth)
    const { strokeDasharray, strokeDashoffset } = calculateCirclePath(
      radius,
      strokeWidth,
      clampedPercentage
    )
    
    const strokeColor = getProgressVariantClasses(effectiveVariant).replace('bg-', 'text-')
    
    return (
      <div 
        className={classNames(progressCircleBaseClasses, className)}
        style={{ width: `${svgWidth}px`, height: `${svgHeight}px` }}
        {...props}
      >
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        >
          {/* Background circle */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="currentColor"
            className={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.3s ease',
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
            }}
            role="progressbar"
            aria-label={`Progress: ${clampedPercentage}%`}
            aria-valuenow={clampedPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </svg>
        {shouldShowText && (
          <div 
            className={classNames(
              progressCircleTextClasses,
              progressTextSizeClasses[size],
              'font-medium',
              getProgressTextColorClasses(effectiveVariant)
            )}
          >
            {displayText}
          </div>
        )}
      </div>
    )
  }
  
  if (type === 'circle') {
    return renderCircleProgress()
  }
  return renderLineProgress()
}
