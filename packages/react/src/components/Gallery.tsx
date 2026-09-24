import React, { useState } from 'react'
import {
  basicLabel,
  clampGalleryIndex,
  classNames,
  formatGalleryCount,
  type GalleryItem,
  type GalleryProps as CoreGalleryProps
} from '@expcat/tigercat-core'
import { Image } from './Image'
import { ImagePreview } from './ImagePreview'
import { useTigerConfig } from './tiger-config'

export interface GalleryProps
  extends CoreGalleryProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  onCurrentIndexChange?: (index: number) => void
  onOpenChange?: (open: boolean) => void
}

export const Gallery: React.FC<GalleryProps> = ({
  items,
  currentIndex,
  defaultCurrentIndex = 0,
  className,
  onCurrentIndexChange,
  onOpenChange,
  ...rest
}) => {
  const config = useTigerConfig()
  const [internalIndex, setInternalIndex] = useState(defaultCurrentIndex)
  const [open, setOpen] = useState(false)
  const index = clampGalleryIndex(currentIndex ?? internalIndex, items.length)
  const current = items[index]
  const count = formatGalleryCount(
    basicLabel(config.locale?.locale, 'gallery', 'count'),
    items.length ? index + 1 : 0,
    items.length
  )
  const openLabel = basicLabel(config.locale?.locale, 'gallery', 'open')
  const listLabel = basicLabel(config.locale?.locale, 'gallery', 'list')

  const select = (next: number) => {
    if (currentIndex === undefined) setInternalIndex(next)
    onCurrentIndexChange?.(next)
  }

  return (
    <div {...rest} className={classNames('flex flex-col gap-2', className)} data-gallery="">
      {current ? (
        <button
          type="button"
          className="inline-flex w-fit border-0 bg-transparent p-0"
          aria-label={openLabel}
          onClick={() => {
            setOpen(true)
            onOpenChange?.(true)
          }}>
          <Image src={current.src} alt={current.alt} preview={false} width={240} height={160} />
        </button>
      ) : null}
      <p data-gallery-count="">{count}</p>
      <div role="list" aria-label={listLabel} className="flex flex-wrap gap-2">
        {items.map((item, itemIndex) => (
          <button
            key={`${item.src}-${itemIndex}`}
            type="button"
            role="listitem"
            className={classNames(
              'border-2 bg-transparent p-0',
              itemIndex === index ? 'border-[var(--tiger-primary)]' : 'border-transparent'
            )}
            aria-current={itemIndex === index ? 'true' : undefined}
            onClick={() => select(itemIndex)}>
            <Image src={item.src} alt={item.alt} preview={false} width={64} height={64} />
          </button>
        ))}
      </div>
      <ImagePreview
        open={open}
        images={items.map((item) => ({ src: item.src, alt: item.alt }))}
        currentIndex={index}
        onOpenChange={(value) => {
          setOpen(value)
          onOpenChange?.(value)
        }}
        onCurrentIndexChange={select}
      />
    </div>
  )
}

export default Gallery
