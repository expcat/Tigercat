import React, { forwardRef, useMemo } from 'react'
import {
  classNames,
  resultBaseClasses,
  resultIconContainerBaseClasses,
  resultIconClasses,
  resultHttpLabelClasses,
  resultTitleClasses,
  resultSubTitleClasses,
  resultExtraClasses,
  RESULT_ICON_SIZE_PX,
  getResultColorScheme,
  getResultIconPath,
  isHttpResultStatus,
  resultHeadingTag,
  type ResultProps as CoreResultProps
} from '@expcat/tigercat-core'
import { StatusIcon } from './shared/icons'

export interface ResultProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    Omit<CoreResultProps, 'title' | 'subTitle'> {
  /** Title content — rendered as a heading. Not the native HTML tooltip. */
  title?: React.ReactNode
  /** Subtitle / description */
  subTitle?: React.ReactNode
  /** Custom icon node — overrides the default status icon */
  icon?: React.ReactNode
  /** Action buttons / links below the subtitle */
  extra?: React.ReactNode
  /** Additional body content */
  children?: React.ReactNode
}

export const Result = forwardRef<HTMLDivElement, ResultProps>(function Result(
  { status = 'info', title, subTitle, headingLevel, icon, extra, className, children, ...props },
  ref
) {
  const colors = useMemo(() => getResultColorScheme(status), [status])
  const iconPath = useMemo(() => getResultIconPath(status), [status])
  const httpLabel = isHttpResultStatus(status) ? status : undefined
  const hasTitle = title !== undefined && title !== null && title !== false && title !== ''
  const Heading = resultHeadingTag(headingLevel)

  const wrapperClasses = classNames(resultBaseClasses, className)
  const iconSvgCls = classNames(resultIconClasses, colors.iconColor)
  const titleCls = resultTitleClasses

  return (
    <div ref={ref} className={wrapperClasses} {...props}>
      <div
        className={resultIconContainerBaseClasses}
        style={{
          width: RESULT_ICON_SIZE_PX,
          height: RESULT_ICON_SIZE_PX,
          background: colors.iconBg
        }}>
        {icon !== undefined ? (
          icon
        ) : httpLabel ? (
          <span
            className={classNames(resultHttpLabelClasses, colors.iconColor)}
            aria-hidden={hasTitle ? true : undefined}>
            {httpLabel}
          </span>
        ) : (
          <StatusIcon path={iconPath} className={iconSvgCls} aria-hidden="true" focusable="false" />
        )}
      </div>

      {hasTitle ? <Heading className={titleCls}>{title}</Heading> : null}

      {subTitle ? <div className={resultSubTitleClasses}>{subTitle}</div> : null}

      {extra ? <div className={resultExtraClasses}>{extra}</div> : null}

      {children ? <div className="mt-6 w-full">{children}</div> : null}
    </div>
  )
})
