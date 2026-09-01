import React from 'react'
import {
  DEFAULT_LOADING_BAR_COLOR,
  DEFAULT_LOADING_BAR_HEIGHT,
  getLoadingBarContainerClasses,
  getLoadingBarFillClasses,
  getLoadingBarFillStyle,
  getLoadingBarProgressValue,
  getLoadingLabel,
  type LoadingBarContainerProps as CoreLoadingBarContainerProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { getGlobalTigerLocale } from '../utils/global-locale'

export interface LoadingBarContainerProps
  extends
    CoreLoadingBarContainerProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, keyof CoreLoadingBarContainerProps | 'role'> {}

export const LoadingBarContainer: React.FC<LoadingBarContainerProps> = ({
  percentage = 0,
  status = 'idle',
  color = DEFAULT_LOADING_BAR_COLOR,
  height = DEFAULT_LOADING_BAR_HEIGHT,
  className,
  style,
  ariaLabel,
  role: _role,
  ...rest
}) => {
  const config = useTigerConfig()
  const locale = config.locale ?? getGlobalTigerLocale()
  const isBusy = status === 'loading'
  const resolvedAriaLabel = getLoadingLabel(locale, ariaLabel)
  const valueNow = getLoadingBarProgressValue(percentage)
  const {
    'aria-label': _ariaLabel,
    'aria-live': _ariaLive,
    'aria-atomic': _ariaAtomic,
    'aria-busy': _ariaBusy,
    'aria-valuenow': _ariaValueNow,
    'aria-valuemin': _ariaValueMin,
    'aria-valuemax': _ariaValueMax,
    ...domRest
  } = rest as React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>

  return (
    <div
      {...domRest}
      className={getLoadingBarContainerClasses(className)}
      style={{ ...style, height: `${height}px` }}
      role="progressbar"
      aria-label={resolvedAriaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={valueNow}
      aria-busy={isBusy || undefined}
      data-tiger-loading-bar-container=""
      data-tiger-loading-bar-status={status}>
      <div
        className={getLoadingBarFillClasses(status, color)}
        style={getLoadingBarFillStyle(percentage, height)}
        data-tiger-loading-bar=""
        data-tiger-loading-bar-status={status}
      />
    </div>
  )
}

export default LoadingBarContainer
