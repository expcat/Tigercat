import React, { useState, useCallback } from 'react'
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
  type PaginationSize,
  type PaginationAlign,
} from '@tigercat/core'

export interface PaginationProps {
  /**
   * Current page number (1-indexed)
   * @default 1
   */
  current?: number

  /**
   * Default current page (for uncontrolled mode)
   * @default 1
   */
  defaultCurrent?: number

  /**
   * Total number of items
   * @default 0
   */
  total?: number

  /**
   * Number of items per page
   * @default 10
   */
  pageSize?: number

  /**
   * Default page size (for uncontrolled mode)
   * @default 10
   */
  defaultPageSize?: number

  /**
   * Available page size options
   * @default [10, 20, 50, 100]
   */
  pageSizeOptions?: number[]

  /**
   * Whether to show quick jumper (input for page number)
   * @default false
   */
  showQuickJumper?: boolean

  /**
   * Whether to show page size selector
   * @default false
   */
  showSizeChanger?: boolean

  /**
   * Whether to show total count
   * @default true
   */
  showTotal?: boolean

  /**
   * Custom total text renderer
   * @param total - Total number of items
   * @param range - Current page range [start, end]
   * @returns Custom text to display
   */
  totalText?: (total: number, range: [number, number]) => string

  /**
   * Simple mode - only show prev/next buttons
   * @default false
   */
  simple?: boolean

  /**
   * Size of pagination
   * @default 'medium'
   */
  size?: PaginationSize

  /**
   * Alignment of pagination
   * @default 'center'
   */
  align?: PaginationAlign

  /**
   * Whether pagination is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Whether to hide pagination on single page
   * @default false
   */
  hideOnSinglePage?: boolean

  /**
   * Whether to show less items (affects page number range)
   * @default false
   */
  showLessItems?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Custom styles
   */
  style?: React.CSSProperties

  /**
   * Callback when page changes
   */
  onChange?: (current: number, pageSize: number) => void

  /**
   * Callback when page size changes
   */
  onPageSizeChange?: (current: number, pageSize: number) => void
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
  ...props
}) => {
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
  const handlePageChange = useCallback((page: number) => {
    if (disabled) return
    if (page === validatedCurrentPage) return
    if (page < 1 || page > totalPages) return

    // Update internal state if uncontrolled
    if (controlledCurrent === undefined) {
      setInternalCurrent(page)
    }

    // Call onChange callback
    onChange?.(page, currentPageSize)
  }, [disabled, validatedCurrentPage, totalPages, controlledCurrent, onChange, currentPageSize])

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
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
  }, [disabled, total, validatedCurrentPage, controlledPageSize, controlledCurrent, onPageSizeChange, onChange])

  // Handle quick jumper submit
  const handleQuickJumperSubmit = useCallback(() => {
    const page = parseInt(quickJumperValue, 10)
    if (!isNaN(page)) {
      handlePageChange(page)
    }
    setQuickJumperValue('')
  }, [quickJumperValue, handlePageChange])

  // Handle quick jumper keypress
  const handleQuickJumperKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleQuickJumperSubmit()
    }
  }, [handleQuickJumperSubmit])

  // Container classes
  const containerClasses = getPaginationContainerClasses(align, className)

  const elements: React.ReactNode[] = []

  // Show total text
  if (showTotal) {
    const totalTextFn = totalText || defaultTotalText
    const totalTextContent = totalTextFn(total, pageRange)
    
    elements.push(
      <span
        key="total"
        className={getTotalTextClasses(size)}
      >
        {totalTextContent}
      </span>
    )
  }

  if (simple) {
    // Simple mode: only prev, current/total, next
    const prevDisabled = validatedCurrentPage <= 1 || disabled
    const nextDisabled = validatedCurrentPage >= totalPages || disabled

    // Previous button
    elements.push(
      <button
        key="prev"
        type="button"
        className={getPaginationButtonBaseClasses(size)}
        disabled={prevDisabled}
        onClick={() => handlePageChange(validatedCurrentPage - 1)}
        aria-label="上一页"
      >
        ‹
      </button>
    )

    // Current/Total display
    elements.push(
      <span
        key="current"
        className={classNames(
          'mx-2',
          size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base'
        )}
      >
        {validatedCurrentPage} / {totalPages}
      </span>
    )

    // Next button
    elements.push(
      <button
        key="next"
        type="button"
        className={getPaginationButtonBaseClasses(size)}
        disabled={nextDisabled}
        onClick={() => handlePageChange(validatedCurrentPage + 1)}
        aria-label="下一页"
      >
        ›
      </button>
    )
  } else {
    // Full mode: prev, page numbers, next
    const prevDisabled = validatedCurrentPage <= 1 || disabled
    const nextDisabled = validatedCurrentPage >= totalPages || disabled

    // Previous button
    elements.push(
      <button
        key="prev"
        type="button"
        className={getPaginationButtonBaseClasses(size)}
        disabled={prevDisabled}
        onClick={() => handlePageChange(validatedCurrentPage - 1)}
        aria-label="上一页"
      >
        ‹
      </button>
    )

    // Page numbers
    const pageNumbers = getPageNumbers(validatedCurrentPage, totalPages, showLessItems)
    pageNumbers.forEach((pageNum, index) => {
      if (pageNum === '...') {
        elements.push(
          <span
            key={`ellipsis-${index}`}
            className={getPaginationEllipsisClasses(size)}
            aria-hidden="true"
          >
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
            aria-label={`第 ${pageNum} 页`}
            aria-current={isActive ? 'page' : undefined}
          >
            {String(pageNum)}
          </button>
        )
      }
    })

    // Next button
    elements.push(
      <button
        key="next"
        type="button"
        className={getPaginationButtonBaseClasses(size)}
        disabled={nextDisabled}
        onClick={() => handlePageChange(validatedCurrentPage + 1)}
        aria-label="下一页"
      >
        ›
      </button>
    )
  }

  // Show page size selector
  if (showSizeChanger) {
    elements.push(
      <select
        key="size-changer"
        className={getPageSizeSelectorClasses(size)}
        disabled={disabled}
        value={currentPageSize}
        onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
        aria-label="每页条数"
      >
        {pageSizeOptions.map(sizeOption => (
          <option key={sizeOption} value={sizeOption}>
            {sizeOption} 条/页
          </option>
        ))}
      </select>
    )
  }

  // Show quick jumper
  if (showQuickJumper) {
    elements.push(
      <span
        key="jumper-label-start"
        className={classNames(
          'ml-2',
          size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base'
        )}
      >
        跳至
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
        aria-label="跳转页码"
      />
    )
    elements.push(
      <span
        key="jumper-label-end"
        className={size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base'}
      >
        页
      </span>
    )
  }

  return (
    <nav
      className={containerClasses}
      role="navigation"
      aria-label="分页导航"
      style={style}
      {...props}
    >
      {elements}
    </nav>
  )
}

export default Pagination
