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
  paginatePrintPreview,
  getPrintLayoutLabels,
  createPrintInstanceId,
  getPrintLayoutPageKey,
  mountPrintInstanceStyle,
  mergeTigerLocale,
  printLayoutFooterClasses,
  printLayoutHeaderClasses,
  printLayoutPageBreakClasses,
  printLayoutPageBreakLabelClasses,
  PRINT_LAYOUT_MARGIN,
  printPrintLayoutRoot,
  resolvePrintPageBox,
  type PrintLayoutInstance,
  type PrintLayoutProps as CorePrintLayoutProps,
  type PrintOrientation,
  type PrintPageSize,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'

const printUnitMm: Record<string, number> = {
  mm: 1,
  cm: 10,
  in: 25.4,
  px: 25.4 / 96,
  pt: 25.4 / 72,
  pc: 25.4 / 6
}

const PrintLayoutContext = React.createContext<{
  showPageBreaks: boolean
  printBreaks: boolean
  locale?: Partial<TigerLocale>
}>({
  showPageBreaks: true,
  printBreaks: true
})

export type { PrintLayoutInstance }

export interface PrintLayoutProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>, CorePrintLayoutProps {
  headerRender?: React.ReactNode
  footerRender?: React.ReactNode
  children?: React.ReactNode
  locale?: Partial<TigerLocale>
  bind?: {
    contentHeightMm?: number
    pageHeightMm?: number
    marginMm?: number
    manualBreaks?: number
  }
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
    printBreaks = true,
    pageWidth,
    pageHeight,
    className,
    children,
    locale,
    bind,
    ...rest
  },
  ref
) {
  const rootRef = useRef<HTMLDivElement>(null)
  const instanceId = useRef(createPrintInstanceId())
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
    const doc = rootRef.current?.ownerDocument ?? document
    return mountPrintInstanceStyle(doc, instanceId.current, box)
  }, [box])

  useImperativeHandle(
    ref,
    () => ({
      print: () => printPrintLayoutRoot(rootRef.current),
      getRoot: () => rootRef.current
    }),
    []
  )

  const header = showHeader
    ? headerRender != null && typeof headerRender !== 'boolean'
      ? headerRender
      : headerText
    : null
  const footer = showFooter
    ? footerRender != null && typeof footerRender !== 'boolean'
      ? footerRender
      : footerText
    : null
  const pageHeightMm = Number.parseFloat(box.height) * printUnitMm[box.height.slice(-2)]

  return (
    <PrintLayoutContext.Provider value={{ showPageBreaks, printBreaks, locale }}>
      <div
        {...rest}
        ref={rootRef}
        className={getPrintLayoutClasses(className)}
        style={{ ...getPrintLayoutBoxStyle(box), ...(rest.style as React.CSSProperties) }}
        data-tiger-print={pageKey}
        data-tiger-print-instance={instanceId.current}
        data-tiger-print-size={box.pageSize}>
        {bind ? (
          <div className="print:hidden" data-tiger-print-preview="">
            {paginatePrintPreview({
              contentHeightMm: bind.contentHeightMm ?? 0,
              pageHeightMm: bind.pageHeightMm ?? pageHeightMm,
              marginMm: bind.marginMm ?? Number.parseFloat(PRINT_LAYOUT_MARGIN),
              manualBreaks: bind.manualBreaks
            }).map((page) => (
              <span key={page.index} data-page-number={page.numberLabel}>
                {page.numberLabel}
              </span>
            ))}
          </div>
        ) : null}
        <table className="w-full border-collapse">
          {header != null && typeof header !== 'boolean' ? (
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
          {footer != null && typeof footer !== 'boolean' ? (
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
    const { showPageBreaks, printBreaks, locale: layoutLocale } = useContext(PrintLayoutContext)
    const config = useTigerConfig()
    const label = getPrintLayoutLabels(
      mergeTigerLocale(mergeTigerLocale(config.locale, layoutLocale), locale)
    ).pageBreak
    return (
      <div
        {...rest}
        ref={ref}
        className={classNames(printBreaks && 'print:break-before-page', className)}
        aria-hidden={ariaHidden ?? true}>
        {showPageBreaks ? (
          <div className={printLayoutPageBreakClasses}>
            <span className={printLayoutPageBreakLabelClasses}>{children ?? label}</span>
          </div>
        ) : null}
      </div>
    )
  }
)

PrintPageBreak.displayName = 'PrintPageBreak'
