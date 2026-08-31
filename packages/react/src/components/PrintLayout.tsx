import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef
} from 'react'
import {
  classNames,
  getPrintLayoutBoxStyle,
  getPrintLayoutClasses,
  getPrintLayoutLabels,
  getPrintLayoutPageKey,
  injectPrintLayoutStyles,
  mergeTigerLocale,
  printLayoutFooterClasses,
  printLayoutHeaderClasses,
  printLayoutPageBreakClasses,
  printLayoutPageBreakLabelClasses,
  printPrintLayoutRoot,
  resolvePrintPageBox,
  type PrintLayoutInstance,
  type PrintLayoutProps as CorePrintLayoutProps,
  type PrintOrientation,
  type PrintPageSize,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

const PrintLayoutContext = React.createContext<{ showPageBreaks: boolean }>({
  showPageBreaks: true
})

export type { PrintLayoutInstance }

export interface PrintLayoutProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>, CorePrintLayoutProps {
  headerRender?: React.ReactNode
  footerRender?: React.ReactNode
  children?: React.ReactNode
  locale?: Partial<TigerLocale>
}

export const PrintLayout = forwardRef<PrintLayoutInstance, PrintLayoutProps>(function PrintLayout(
  {
    pageSize = 'A4',
    orientation = 'portrait',
    showHeader = false,
    showFooter = false,
    headerText,
    footerText,
    headerRender,
    footerRender,
    showPageBreaks = true,
    pageWidth,
    pageHeight,
    className,
    children,
    locale,
    ...rest
  },
  ref
) {
  const rootRef = useRef<HTMLDivElement>(null)
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const box = useMemo(
    () =>
      resolvePrintPageBox(
        pageSize as PrintPageSize,
        orientation as PrintOrientation,
        pageWidth,
        pageHeight
      ),
    [pageSize, orientation, pageWidth, pageHeight]
  )
  const pageKey = getPrintLayoutPageKey(box)

  useEffect(() => {
    injectPrintLayoutStyles()
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      print: () => printPrintLayoutRoot(rootRef.current),
      getRoot: () => rootRef.current
    }),
    []
  )

  const header = showHeader ? headerRender || headerText : null
  const footer = showFooter ? footerRender || footerText : null

  return (
    <PrintLayoutContext.Provider value={{ showPageBreaks }}>
      <div
        {...rest}
        ref={rootRef}
        className={getPrintLayoutClasses(className)}
        style={{ ...getPrintLayoutBoxStyle(box), ...(rest.style as React.CSSProperties) }}
        data-tiger-print={pageKey}>
        <table className="w-full border-collapse">
          {header ? (
            <thead>
              <tr>
                <th className={printLayoutHeaderClasses}>{header}</th>
              </tr>
            </thead>
          ) : null}
          <tbody>
            <tr>
              <td className="tiger-print-content">{children}</td>
            </tr>
          </tbody>
          {footer ? (
            <tfoot>
              <tr>
                <td className={printLayoutFooterClasses}>{footer}</td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </PrintLayoutContext.Provider>
  )
})

PrintLayout.displayName = 'PrintLayout'

export interface PrintPageBreakProps extends React.HTMLAttributes<HTMLDivElement> {
  locale?: Partial<TigerLocale>
}

export const PrintPageBreak = forwardRef<HTMLDivElement, PrintPageBreakProps>(
  function PrintPageBreak(
    { className, locale, children, 'aria-hidden': ariaHidden, ...rest },
    ref
  ) {
    const { showPageBreaks } = useContext(PrintLayoutContext)
    const config = useTigerConfig()
    const label = getPrintLayoutLabels(mergeTigerLocale(config.locale, locale)).pageBreak
    return (
      <div
        {...rest}
        ref={ref}
        className={classNames('print:break-before-page', className)}
        aria-hidden={ariaHidden ?? true}>
        {showPageBreaks ? (
          <div
            className={classNames(printLayoutPageBreakClasses, printLayoutPageBreakLabelClasses)}>
            {children ?? label}
          </div>
        ) : null}
      </div>
    )
  }
)

PrintPageBreak.displayName = 'PrintPageBreak'
