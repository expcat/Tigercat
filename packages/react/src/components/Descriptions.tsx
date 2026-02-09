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
  type DescriptionsItem
} from '@expcat/tigercat-core'

export interface DescriptionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
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
  ...props
}) => {
  const renderHeader = () => {
    if (!title && !extra) return null

    return (
      <div className={descriptionsHeaderClasses}>
        {title ? <div className={descriptionsTitleClasses}>{title}</div> : null}
        {extra ? <div className={descriptionsExtraClasses}>{extra}</div> : null}
      </div>
    )
  }

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

      cells.push(
        <th key={`${key}-label`} className={labelClass} style={labelStyle}>
          {item.label}
          {colon ? ':' : ''}
        </th>
      )

      cells.push(
        <td
          key={`${key}-content`}
          className={contentClass}
          style={contentStyle}
          colSpan={span > 1 ? span * 2 - 1 : 1}>
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

    const itemClasses = getDescriptionsVerticalItemClasses(size)
    return (
      <div key={index} className={itemClasses}>
        <dt className={labelClass} style={labelStyle}>
          {item.label}
          {colon ? ':' : ''}
        </dt>
        <dd className={contentClass} style={contentStyle}>
          {item.content as React.ReactNode}
        </dd>
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

    return (
      <dl className={descriptionsVerticalWrapperClasses}>
        {items.map((item, index) => renderVerticalItem(item, index))}
      </dl>
    )
  }

  const descriptionsClasses = classNames(
    descriptionsWrapperClasses,
    getDescriptionsClasses(size),
    className
  )

  return (
    <div className={descriptionsClasses} {...props}>
      {renderHeader()}
      {layout === 'horizontal' ? renderHorizontalLayout() : renderVerticalLayout()}
      {children}
    </div>
  )
}

export default Descriptions
