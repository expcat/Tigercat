import React, { useMemo } from 'react'
import {
  classNames,
  resultBaseClasses,
  resultIconContainerBaseClasses,
  resultIconClasses,
  resultTitleClasses,
  resultSubTitleClasses,
  resultExtraClasses,
  getResultColorScheme,
  getResultIconPath,
  getResultHttpLabel,
  type ResultProps as CoreResultProps
} from '@expcat/tigercat-core'
import { StatusIcon } from './shared/icons'

export interface ResultProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>, CoreResultProps {
  /** Custom icon node — overrides the default status icon */
  icon?: React.ReactNode
  /** Action buttons / links below the subtitle */
  extra?: React.ReactNode
  /** Additional body content */
  children?: React.ReactNode
}

export const Result: React.FC<ResultProps> = ({
  status = 'info',
  title,
  subTitle,
  icon,
  extra,
  className,
  children,
  ...props
}) => {
  const colors = useMemo(() => getResultColorScheme(status), [status])
  const iconPath = useMemo(() => getResultIconPath(status), [status])
  const httpLabel = useMemo(() => getResultHttpLabel(status), [status])

  const wrapperClasses = useMemo(() => classNames(resultBaseClasses, className), [className])

  const iconContainerCls = useMemo(
    () => classNames(resultIconContainerBaseClasses, colors.iconBg),
    [colors]
  )

  const iconSvgCls = useMemo(() => classNames(resultIconClasses, colors.iconColor), [colors])

  const titleCls = useMemo(() => classNames(resultTitleClasses, colors.titleColor), [colors])

  return (
    <div className={wrapperClasses} role="status" {...props}>
      {/* Icon */}
      <div className={iconContainerCls}>
        {icon !== undefined ? (
          icon
        ) : httpLabel ? (
          <span className={classNames('text-5xl font-bold', colors.iconColor)}>{httpLabel}</span>
        ) : (
          <StatusIcon path={iconPath} className={iconSvgCls} />
        )}
      </div>

      {/* Title */}
      {title && <div className={titleCls}>{title}</div>}

      {/* SubTitle */}
      {subTitle && <div className={resultSubTitleClasses}>{subTitle}</div>}

      {/* Extra (actions) */}
      {extra && <div className={resultExtraClasses}>{extra}</div>}

      {/* Children body */}
      {children && <div className="mt-6 w-full">{children}</div>}
    </div>
  )
}
