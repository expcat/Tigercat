import { useMemo } from 'react'
import { 
  classNames, 
  getSkeletonClasses,
  getSkeletonDimensions,
  getParagraphRowWidth,
  type SkeletonProps
} from '@tigercat/core'

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  animation = 'pulse',
  width,
  height,
  shape = 'circle',
  rows = 1,
  paragraph = false,
  className,
  ...props
}) => {
  const skeletonClasses = useMemo(() => {
    return classNames(
      getSkeletonClasses(variant, animation, shape),
      className
    )
  }, [variant, animation, shape, className])

  const dimensions = useMemo(() => {
    return getSkeletonDimensions(variant, width, height)
  }, [variant, width, height])

  const skeletonStyle = useMemo(() => {
    const style: React.CSSProperties = {}
    
    if (dimensions.width) {
      style.width = dimensions.width
    }
    if (dimensions.height) {
      style.height = dimensions.height
    }
    
    return style
  }, [dimensions])

  // For text variant with multiple rows
  if (variant === 'text' && rows > 1) {
    const rowElements = []
    
    for (let i = 0; i < rows; i++) {
      const rowStyle: React.CSSProperties = {
        height: dimensions.height,
      }
      
      // Apply paragraph widths if paragraph mode is enabled
      if (paragraph) {
        rowStyle.width = getParagraphRowWidth(i, rows)
      } else if (dimensions.width) {
        rowStyle.width = dimensions.width
      }
      
      rowElements.push(
        <div
          key={i}
          className={classNames(
            skeletonClasses,
            i < rows - 1 && 'mb-2'
          )}
          style={rowStyle}
        />
      )
    }
    
    return <div className="flex flex-col">{rowElements}</div>
  }
  
  // Single skeleton element
  return (
    <div
      className={skeletonClasses}
      style={skeletonStyle}
      {...props}
    />
  )
}
