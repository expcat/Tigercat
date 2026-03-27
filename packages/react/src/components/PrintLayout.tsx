import React, { useMemo } from 'react'
import {
  classNames,
  getPrintLayoutClasses,
  printLayoutHeaderClasses,
  printLayoutFooterClasses,
  printLayoutPageBreakClasses,
  type PrintPageSize,
  type PrintOrientation
} from '@expcat/tigercat-core'

export interface PrintLayoutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  pageSize?: PrintPageSize
  orientation?: PrintOrientation
  showHeader?: boolean
  showFooter?: boolean
  headerText?: string
  footerText?: string
  headerRender?: React.ReactNode
  footerRender?: React.ReactNode
  showPageBreaks?: boolean
  className?: string
  children?: React.ReactNode
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({
  pageSize = 'A4',
  orientation = 'portrait',
  showHeader = false,
  showFooter = false,
  headerText,
  footerText,
  headerRender,
  footerRender,
  className,
  children,
  ...rest
}) => {
  const classes = useMemo(
    () => getPrintLayoutClasses(pageSize, orientation, className),
    [pageSize, orientation, className]
  )

  return (
    <div {...rest} className={classes}>
      {showHeader && (headerRender || headerText) && (
        <div className={printLayoutHeaderClasses}>{headerRender || headerText}</div>
      )}
      <div className="tiger-print-content">{children}</div>
      {showFooter && (footerRender || footerText) && (
        <div className={printLayoutFooterClasses}>{footerRender || footerText}</div>
      )}
    </div>
  )
}

export interface PrintPageBreakProps extends React.HTMLAttributes<HTMLDivElement> {}

export const PrintPageBreak: React.FC<PrintPageBreakProps> = (props) => (
  <div
    {...props}
    className={classNames(printLayoutPageBreakClasses, 'print:break-before-page')}
    aria-hidden="true"
  />
)
