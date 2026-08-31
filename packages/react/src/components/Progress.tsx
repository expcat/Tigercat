import React, { useLayoutEffect, useMemo } from 'react'
import {
  calculateCirclePath,
  classNames,
  getCircleSize,
  getProgressFillClasses,
  getProgressLabels,
  getProgressStrokeClasses,
  getProgressTextColorClasses,
  injectProgressStyles,
  progressCircleBaseClasses,
  progressCircleTextClasses,
  progressCircleTrackStrokeClasses,
  progressLineBaseClasses,
  progressLineSizeClasses,
  progressTextBaseClasses,
  progressTextSizeClasses,
  progressTrackBgClasses,
  resolveProgressView,
  type ProgressProps as CoreProgressProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface ProgressProps
  extends CoreProgressProps, Omit<React.HTMLAttributes<HTMLDivElement>, keyof CoreProgressProps> {}

export const Progress: React.FC<ProgressProps> = React.memo(
  ({
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
    const config = useTigerConfig()
    const widgetName = getProgressLabels(config.locale).ariaLabel

    useLayoutEffect(() => {
      injectProgressStyles()
    }, [])

    const view = useMemo(
      () =>
        resolveProgressView({
          percentage,
          variant,
          status,
          type,
          showText,
          text,
          format,
          striped,
          stripedAnimation,
          ariaLabel,
          ariaLabelledby,
          widgetName
        }),
      [
        percentage,
        variant,
        status,
        type,
        showText,
        text,
        format,
        striped,
        stripedAnimation,
        ariaLabel,
        ariaLabelledby,
        widgetName
      ]
    )

    const ariaAttrs = {
      role: 'progressbar' as const,
      'aria-label': view.ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
      'aria-valuenow': view.valueNow,
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuetext': view.valueText
    }

    if (type === 'circle') {
      const {
        width: svgWidth,
        height: svgHeight,
        radius,
        cx,
        cy,
        strokeWidth: safeStroke
      } = getCircleSize(size, strokeWidth)
      const { strokeDasharray, strokeDashoffset } = calculateCirclePath(radius, view.percentage)

      return (
        <div
          {...props}
          className={classNames(
            progressCircleBaseClasses,
            view.paused && 'tiger-progress-paused',
            className
          )}
          style={{
            ...(style ?? {}),
            width: `${svgWidth}px`,
            height: `${svgHeight}px`
          }}
          {...ariaAttrs}>
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            aria-hidden="true">
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="currentColor"
              className={progressCircleTrackStrokeClasses}
              strokeWidth={safeStroke}
            />
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="currentColor"
              className={classNames(
                'tiger-progress-fill',
                getProgressStrokeClasses(view.effectiveVariant)
              )}
              strokeWidth={safeStroke}
              strokeLinecap={view.percentage === 0 ? 'butt' : 'round'}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: 'center'
              }}
            />
          </svg>
          {view.shouldShowText && (
            <div
              className={classNames(
                progressCircleTextClasses,
                progressTextSizeClasses[size],
                'font-medium',
                getProgressTextColorClasses(view.effectiveVariant)
              )}>
              {view.displayText}
            </div>
          )}
        </div>
      )
    }

    const containerStyle =
      width !== 'auto' ? { width: typeof width === 'number' ? `${width}px` : width } : {}

    return (
      <div
        {...props}
        className={classNames(
          'flex items-center w-full',
          view.paused && 'tiger-progress-paused',
          className
        )}
        style={{ ...(style ?? {}), ...containerStyle }}
        {...ariaAttrs}>
        <div
          className={classNames(
            progressLineBaseClasses,
            progressTrackBgClasses,
            !height && progressLineSizeClasses[size]
          )}
          style={{ flex: 1, ...(height ? { height: `${height}px` } : {}) }}>
          <div className={getProgressFillClasses(view)} style={{ width: `${view.percentage}%` }} />
        </div>
        {view.shouldShowText && (
          <span
            className={classNames(
              progressTextBaseClasses,
              progressTextSizeClasses[size],
              getProgressTextColorClasses(view.effectiveVariant)
            )}>
            {view.displayText}
          </span>
        )}
      </div>
    )
  }
)
Progress.displayName = 'Progress'
