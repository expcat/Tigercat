import React, { useMemo, useContext } from 'react'
import {
  classNames,
  getPrintLayoutClasses,
  printLayoutHeaderClasses,
  printLayoutFooterClasses,
  printLayoutPageBreakClasses,
  type PrintPageSize,
  type PrintOrientation
} from '@expcat/tigercat-core'

/**
 * Shares `showPageBreaks` from a PrintLayout down to nested PrintPageBreak
 * indicators. Defaults to showing indicators when used standalone.
 */
const PrintLayoutContext = React.createContext<{ showPageBreaks: boolean }>({
  showPageBreaks: true
})

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
  showPageBreaks = true,
  className,
  children,
  ...rest
}) => {
  const classes = useMemo(
    () => getPrintLayoutClasses(pageSize, orientation, className),
    [pageSize, orientation, className]
  )

  const contextValue = useMemo(() => ({ showPageBreaks }), [showPageBreaks])

  return (
    <PrintLayoutContext.Provider value={contextValue}>
      <div {...rest} className={classes}>
        {showHeader && (headerRender || headerText) && (
          <div className={printLayoutHeaderClasses}>{headerRender || headerText}</div>
        )}
        <div className="tiger-print-content">{children}</div>
        {showFooter && (footerRender || footerText) && (
          <div className={printLayoutFooterClasses}>{footerRender || footerText}</div>
        )}
      </div>
    </PrintLayoutContext.Provider>
  )
}

export interface PrintPageBreakProps extends React.HTMLAttributes<HTMLDivElement> {}

export const PrintPageBreak: React.FC<PrintPageBreakProps> = (props) => {
  const { showPageBreaks } = useContext(PrintLayoutContext)
  return (
    <div
      {...props}
      // Always force the print page break; only show the on-screen dashed indicator
      // when the enclosing PrintLayout has `showPageBreaks` enabled.
      className={classNames(
        showPageBreaks && printLayoutPageBreakClasses,
        'print:break-before-page'
      )}
      aria-hidden="true"
    />
  )
}
