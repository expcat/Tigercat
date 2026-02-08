import React, { useState, useCallback, useMemo } from 'react'
import {
  classNames,
  getTotalPages,
  getPageRange,
  validateCurrentPage,
  getPageNumbers,
  defaultTotalText,
  getPaginationContainerClasses,
  getPaginationButtonBaseClasses,
  getPaginationButtonActiveClasses,
  getPaginationEllipsisClasses,
  getQuickJumperInputClasses,
  getPageSizeSelectorClasses,
  getTotalTextClasses,
  getSizeTextClasses,
  getPaginationLabels,
  formatPageAriaLabel,
  type PaginationProps as CorePaginationProps,
  type PaginationPageSizeOptionItem,
  type TigerLocale
} from '@expcat/tigercat-core'

export interface PaginationProps
  extends Omit<CorePaginationProps, 'style'>, Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  style?: React.CSSProperties

  onChange?: (current: number, pageSize: number) => void
  onPageSizeChange?: (current: number, pageSize: number) => void

  /**
   * Locale configuration for i18n support
   */
  locale?: Partial<TigerLocale>
}

export const Pagination: React.FC<PaginationProps> = ({
  current: controlledCurrent,
  defaultCurrent = 1,
  total = 0,
  pageSize: controlledPageSize,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  showQuickJumper = false,
  showSizeChanger = false,
  showTotal = true,
  totalText,
  simple = false,
  size = 'medium',
  align = 'center',
  disabled = false,
  hideOnSinglePage = false,
  showLessItems = false,
  className,
  style,
  onChange,
  onPageSizeChange,
  locale,
  ...props
}) => {
  const { 'aria-label': ariaLabelProp, ...navProps } = props

  // Get resolved locale labels
  const labels = useMemo(() => getPaginationLabels(locale), [locale])

  // Internal state for uncontrolled mode
  const [internalCurrent, setInternalCurrent] = useState<number>(defaultCurrent)
  const [internalPageSize, setInternalPageSize] = useState<number>(defaultPageSize)
  const [quickJumperValue, setQuickJumperValue] = useState<string>('')

  // Use controlled or uncontrolled values
  const currentPage = controlledCurrent !== undefined ? controlledCurrent : internalCurrent
  const currentPageSize = controlledPageSize !== undefined ? controlledPageSize : internalPageSize

  // Calculate total pages
  const totalPages = getTotalPages(total, currentPageSize)

  // Validate and adjust current page
  const validatedCurrentPage = validateCurrentPage(currentPage, totalPages)

  // Calculate current page range
  const pageRange = getPageRange(validatedCurrentPage, currentPageSize, total)

  // Check if should hide on single page
  if (hideOnSinglePage && totalPages <= 1) {
    return null
  }

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      if (disabled) return
      if (page === validatedCurrentPage) return
      if (page < 1 || page > totalPages) return

      // Update internal state if uncontrolled
      if (controlledCurrent === undefined) {
        setInternalCurrent(page)
      }

      // Call onChange callback
      onChange?.(page, currentPageSize)
    },
    [disabled, validatedCurrentPage, totalPages, controlledCurrent, onChange, currentPageSize]
  )

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      if (disabled) return

      const newTotalPages = getTotalPages(total, newPageSize)
      let newPage = validatedCurrentPage

      // Adjust current page if it exceeds new total pages
      if (newPage > newTotalPages) {
        newPage = Math.max(1, newTotalPages)
      }

      // Update internal state if uncontrolled
      if (controlledPageSize === undefined) {
        setInternalPageSize(newPageSize)
      }
      if (controlledCurrent === undefined && newPage !== validatedCurrentPage) {
        setInternalCurrent(newPage)
      }

      // Call callbacks
      onPageSizeChange?.(newPage, newPageSize)

      // Also call onChange if page changed
      if (newPage !== validatedCurrentPage) {
        onChange?.(newPage, newPageSize)
      }
    },
    [
      disabled,
      total,
      validatedCurrentPage,
      controlledPageSize,
      controlledCurrent,
      onPageSizeChange,
      onChange
    ]
  )

  // Handle quick jumper submit
  const handleQuickJumperSubmit = useCallback(() => {
    const page = parseInt(quickJumperValue, 10)
    if (!isNaN(page)) {
      handlePageChange(page)
    }
    setQuickJumperValue('')
  }, [quickJumperValue, handlePageChange])

  // Handle quick jumper keypress
  const handleQuickJumperKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleQuickJumperSubmit()
      }
    },
    [handleQuickJumperSubmit]
  )

  const normalizedPageSizeOptions = useMemo(() => {
    return (pageSizeOptions as PaginationPageSizeOptionItem[]).map((option) => {
      if (typeof option === 'number') {
        return {
          value: option,
          label: `${option} ${labels.itemsPerPageText}`
        }
      }

      const label = option.label ?? `${option.value} ${labels.itemsPerPageText}`
      return { value: option.value, label }
    })
  }, [pageSizeOptions, labels.itemsPerPageText])

  // Container classes
  const containerClasses = getPaginationContainerClasses(align, className)

  const prevDisabled = validatedCurrentPage <= 1 || disabled
  const nextDisabled = validatedCurrentPage >= totalPages || disabled

  const elements: React.ReactNode[] = []

  // Total text
  if (showTotal) {
    const totalTextFn = totalText || defaultTotalText
    elements.push(
      <span key="total" className={getTotalTextClasses(size)}>
        {totalTextFn(total, pageRange)}
      </span>
    )
  }

  // Previous button
  elements.push(
    <button
      key="prev"
      type="button"
      className={getPaginationButtonBaseClasses(size)}
      disabled={prevDisabled}
      onClick={() => handlePageChange(validatedCurrentPage - 1)}
      aria-label={labels.prevPageAriaLabel}>
      ‹
    </button>
  )

  if (simple) {
    // Simple mode: current / total
    elements.push(
      <span key="current" className={classNames('mx-2', getSizeTextClasses(size))}>
        {validatedCurrentPage} / {totalPages}
      </span>
    )
  } else {
    // Full mode: page number buttons
    getPageNumbers(validatedCurrentPage, totalPages, showLessItems).forEach((pageNum, index) => {
      if (pageNum === '...') {
        elements.push(
          <span
            key={`ellipsis-${index}`}
            className={getPaginationEllipsisClasses(size)}
            aria-hidden="true">
            ...
          </span>
        )
      } else {
        const isActive = pageNum === validatedCurrentPage
        elements.push(
          <button
            key={`page-${pageNum}`}
            type="button"
            className={classNames(
              getPaginationButtonBaseClasses(size),
              isActive && getPaginationButtonActiveClasses()
            )}
            disabled={disabled}
            onClick={() => handlePageChange(pageNum as number)}
            aria-label={formatPageAriaLabel(labels.pageAriaLabel, pageNum as number)}
            aria-current={isActive ? 'page' : undefined}>
            {String(pageNum)}
          </button>
        )
      }
    })
  }

  // Next button
  elements.push(
    <button
      key="next"
      type="button"
      className={getPaginationButtonBaseClasses(size)}
      disabled={nextDisabled}
      onClick={() => handlePageChange(validatedCurrentPage + 1)}
      aria-label={labels.nextPageAriaLabel}>
      ›
    </button>
  )

  // Page size selector
  if (showSizeChanger) {
    elements.push(
      <select
        key="size-changer"
        className={getPageSizeSelectorClasses(size)}
        disabled={disabled}
        value={currentPageSize}
        onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
        aria-label={labels.itemsPerPageText}>
        {normalizedPageSizeOptions.map((sizeOption) => (
          <option key={sizeOption.value} value={sizeOption.value}>
            {sizeOption.label}
          </option>
        ))}
      </select>
    )
  }

  // Quick jumper
  if (showQuickJumper) {
    const sizeText = getSizeTextClasses(size)
    elements.push(
      <span key="jumper-label-start" className={classNames('ml-2', sizeText)}>
        {labels.jumpToText}
      </span>
    )
    elements.push(
      <input
        key="jumper-input"
        type="number"
        className={classNames(getQuickJumperInputClasses(size), 'mx-2')}
        disabled={disabled}
        value={quickJumperValue}
        onChange={(e) => setQuickJumperValue(e.target.value)}
        onKeyDown={handleQuickJumperKeyPress}
        min={1}
        max={totalPages}
        aria-label={labels.jumpToText}
      />
    )
    elements.push(
      <span key="jumper-label-end" className={sizeText}>
        {labels.pageText}
      </span>
    )
  }

  return (
    <nav
      className={containerClasses}
      {...navProps}
      role="navigation"
      aria-label={ariaLabelProp ?? 'Pagination'}
      style={style}>
      {elements}
    </nav>
  )
}

export default Pagination
