import React from 'react'
import {
  classNames,
  getDescriptionsClasses,
  getDescriptionsTableClasses,
  getDescriptionsLabelClasses,
  getDescriptionsContentClasses,
  getDescriptionsVerticalItemClasses,
  groupItemsIntoRows,
  descriptionsWrapperClasses,
  descriptionsHeaderClasses,
  descriptionsTitleClasses,
  descriptionsExtraClasses,
  descriptionsVerticalWrapperClasses,
  type DescriptionsSize,
  type DescriptionsLayout,
  type DescriptionsItem,
} from '@tigercat/core'

export interface DescriptionsProps {
  /**
   * Descriptions title
   */
  title?: React.ReactNode
  
  /**
   * Extra content (actions, links, etc.)
   */
  extra?: React.ReactNode
  
  /**
   * Whether to show border
   * @default false
   */
  bordered?: boolean
  
  /**
   * Number of columns per row
   * @default 3
   */
  column?: number
  
  /**
   * Descriptions size
   * @default 'md'
   */
  size?: DescriptionsSize
  
  /**
   * Descriptions layout
   * @default 'horizontal'
   */
  layout?: DescriptionsLayout
  
  /**
   * Whether to show colon after label
   * @default true
   */
  colon?: boolean
  
  /**
   * Label style
   */
  labelStyle?: React.CSSProperties
  
  /**
   * Content style
   */
  contentStyle?: React.CSSProperties
  
  /**
   * Items data source
   */
  items?: DescriptionsItem[]
  
  /**
   * Additional CSS classes
   */
  className?: string
  
  /**
   * Children (for custom content)
   */
  children?: React.ReactNode
}

export const Descriptions: React.FC<DescriptionsProps> = ({
  title,
  extra,
  bordered = false,
  column = 3,
  size = 'md',
  layout = 'horizontal',
  colon = true,
  labelStyle,
  contentStyle,
  items = [],
  className,
  children,
}) => {
  // Render header section
  const renderHeader = () => {
    if (!title && !extra) {
      return null
    }

    return (
      <div className={descriptionsHeaderClasses}>
        {title && <div className={descriptionsTitleClasses}>{title}</div>}
        {extra && <div className={descriptionsExtraClasses}>{extra}</div>}
      </div>
    )
  }

  // Render a single row in horizontal layout
  const renderRow = (rowItems: DescriptionsItem[], rowIndex: number) => {
    const cells: React.ReactNode[] = []

    rowItems.forEach((item, itemIndex) => {
      const span = Math.min(item.span || 1, column)
      const labelClass = classNames(
        getDescriptionsLabelClasses(bordered, size, layout),
        item.labelClassName
      )
      const contentClass = classNames(
        getDescriptionsContentClasses(bordered, size, layout),
        item.contentClassName
      )

      const key = `${rowIndex}-${itemIndex}`

      // Label cell
      cells.push(
        <th key={`${key}-label`} className={labelClass} style={labelStyle}>
          {item.label}
          {colon && layout === 'horizontal' ? ':' : ''}
        </th>
      )

      // Content cell
      cells.push(
        <td
          key={`${key}-content`}
          className={contentClass}
          style={contentStyle}
          colSpan={span > 1 ? span * 2 - 1 : 1}
        >
          {item.content as React.ReactNode}
        </td>
      )
    })

    return <tr key={rowIndex}>{cells}</tr>
  }

  // Render horizontal layout (table-based)
  const renderHorizontalLayout = () => {
    if (items.length === 0 && !children) {
      return null
    }

    // Group items into rows
    const rows = groupItemsIntoRows(items, column)

    return (
      <table className={getDescriptionsTableClasses(bordered)}>
        <tbody>{rows.map((row, index) => renderRow(row, index))}</tbody>
      </table>
    )
  }

  // Render a single item in vertical layout
  const renderVerticalItem = (item: DescriptionsItem, index: number) => {
    const labelClass = classNames(
      getDescriptionsLabelClasses(bordered, size, layout),
      item.labelClassName
    )
    const contentClass = classNames(
      getDescriptionsContentClasses(bordered, size, layout),
      item.contentClassName
    )

    if (bordered) {
      // Table row for bordered layout
      return (
        <tr key={index}>
          <th className={labelClass} style={labelStyle}>
            {item.label}
            {colon ? ':' : ''}
          </th>
          <td className={contentClass} style={contentStyle}>
            {item.content as React.ReactNode}
          </td>
        </tr>
      )
    }

    // Simple div for non-bordered layout
    const itemClasses = getDescriptionsVerticalItemClasses(bordered, size)
    return (
      <div key={index} className={itemClasses}>
        <div className={labelClass} style={labelStyle}>
          {item.label}
          {colon ? ':' : ''}
        </div>
        <div className={contentClass} style={contentStyle}>
          {item.content as React.ReactNode}
        </div>
      </div>
    )
  }

  // Render vertical layout (stacked)
  const renderVerticalLayout = () => {
    if (items.length === 0 && !children) {
      return null
    }

    if (bordered) {
      // Use table for bordered vertical layout
      return (
        <table className={getDescriptionsTableClasses(bordered)}>
          <tbody>{items.map((item, index) => renderVerticalItem(item, index))}</tbody>
        </table>
      )
    }

    // Use simple div layout for non-bordered vertical
    return (
      <div className={descriptionsVerticalWrapperClasses}>
        {items.map((item, index) => renderVerticalItem(item, index))}
      </div>
    )
  }

  const descriptionsClasses = classNames(
    descriptionsWrapperClasses,
    getDescriptionsClasses(bordered, size),
    className
  )

  return (
    <div className={descriptionsClasses}>
      {renderHeader()}
      {layout === 'horizontal' ? renderHorizontalLayout() : renderVerticalLayout()}
      {children}
    </div>
  )
}

export default Descriptions
