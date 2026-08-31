import React, { forwardRef, useMemo } from 'react'
import {
  classNames,
  getAspectRatioContentClasses,
  getAspectRatioRootClasses,
  getAspectRatioStyle,
  ASPECT_RATIO_DEFAULT,
  type AspectRatioProps as CoreAspectRatioProps
} from '@expcat/tigercat-core'

export interface AspectRatioProps
  extends CoreAspectRatioProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  /** Additional CSS classes */
  className?: string
}

export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  (
    {
      ratio = ASPECT_RATIO_DEFAULT,
      className,
      contentClassName,
      children,
      style: styleProp,
      ...rest
    },
    ref
  ) => {
    const rootClasses = useMemo(() => getAspectRatioRootClasses(className), [className])
    const contentClasses = useMemo(
      () => classNames(getAspectRatioContentClasses(), contentClassName),
      [contentClassName]
    )
    const style = useMemo(
      () => ({
        ...(getAspectRatioStyle(ratio) as React.CSSProperties | undefined),
        ...styleProp
      }),
      [ratio, styleProp]
    )

    return (
      <div {...rest} ref={ref} data-aspect-ratio="" className={rootClasses} style={style}>
        <div data-aspect-ratio-content="" className={contentClasses}>
          {children}
        </div>
      </div>
    )
  }
)
AspectRatio.displayName = 'AspectRatio'

export default AspectRatio
