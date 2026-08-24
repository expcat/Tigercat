import React from 'react'
import {
  DEFAULT_LOADING_BAR_ARIA_LABEL,
  DEFAULT_LOADING_BAR_COLOR,
  DEFAULT_LOADING_BAR_HEIGHT,
  getLoadingBarContainerClasses,
  getLoadingBarFillClasses,
  getLoadingBarFillStyle,
  LOADING_BAR_CONTAINER_ID,
  type LoadingBarContainerProps as CoreLoadingBarContainerProps
} from '@expcat/tigercat-core'

export interface LoadingBarContainerProps
  extends
    CoreLoadingBarContainerProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, keyof CoreLoadingBarContainerProps> {}

export const LoadingBarContainer: React.FC<LoadingBarContainerProps> = ({
  percentage = 0,
  status = 'idle',
  color = DEFAULT_LOADING_BAR_COLOR,
  height = DEFAULT_LOADING_BAR_HEIGHT,
  className,
  style,
  ariaLabel,
  ...rest
}) => {
  const isBusy = status === 'loading'
  const resolvedAriaLabel = ariaLabel?.trim() || DEFAULT_LOADING_BAR_ARIA_LABEL

  return (
    <div
      {...rest}
      id={LOADING_BAR_CONTAINER_ID}
      className={getLoadingBarContainerClasses(className)}
      style={{ ...style, height: `${height}px` }}
      data-tiger-loading-bar-container=""
      data-tiger-loading-bar-status={status}>
      <div
        className={getLoadingBarFillClasses(status, color)}
        style={getLoadingBarFillStyle(percentage, height)}
        role="progressbar"
        aria-label={resolvedAriaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percentage)}
        aria-busy={isBusy || undefined}
        aria-live="polite"
        aria-atomic="true"
        data-tiger-loading-bar=""
        data-tiger-loading-bar-status={status}
      />
    </div>
  )
}

export default LoadingBarContainer
