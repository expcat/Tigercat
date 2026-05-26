import { bench, describe } from 'vitest'
import {
  groupItemsIntoRows,
  getDescriptionsClasses,
  getDescriptionsLabelClasses,
  getDescriptionsContentClasses,
  getDescriptionsTableClasses
} from '@expcat/tigercat-core'

function makeItems(n: number, spanVariant: 'uniform' | 'mixed' = 'uniform') {
  return Array.from({ length: n }, (_, i) => ({
    label: `Label ${i}`,
    content: `Content ${i}`,
    span: spanVariant === 'mixed' ? (i % 3) + 1 : 1
  }))
}

describe('groupItemsIntoRows', () => {
  const items100 = makeItems(100)
  const items500 = makeItems(500)
  const items1000 = makeItems(1000)
  const itemsMixed100 = makeItems(100, 'mixed')
  const itemsMixed500 = makeItems(500, 'mixed')
  const itemsMixed1000 = makeItems(1000, 'mixed')

  bench('100 items, 3 columns, uniform span', () => {
    groupItemsIntoRows(items100, 3)
  })

  bench('500 items, 3 columns, uniform span', () => {
    groupItemsIntoRows(items500, 3)
  })

  bench('1000 items, 3 columns, uniform span', () => {
    groupItemsIntoRows(items1000, 3)
  })

  bench('100 items, 4 columns, mixed span (1-3)', () => {
    groupItemsIntoRows(itemsMixed100, 4)
  })

  bench('500 items, 4 columns, mixed span (1-3)', () => {
    groupItemsIntoRows(itemsMixed500, 4)
  })

  bench('1000 items, 4 columns, mixed span (1-3)', () => {
    groupItemsIntoRows(itemsMixed1000, 4)
  })

  bench('1000 items, 1 column (worst-case rows)', () => {
    groupItemsIntoRows(items1000, 1)
  })
})

describe('Descriptions class helpers (per-item overhead)', () => {
  bench('getDescriptionsClasses', () => {
    getDescriptionsClasses('md')
  })

  bench('getDescriptionsTableClasses (bordered)', () => {
    getDescriptionsTableClasses(true)
  })

  bench('getDescriptionsLabelClasses (horizontal, bordered, md)', () => {
    getDescriptionsLabelClasses(true, 'md', 'horizontal')
  })

  bench('getDescriptionsContentClasses (horizontal, bordered, md)', () => {
    getDescriptionsContentClasses(true, 'md', 'horizontal')
  })

  bench('full per-row pipeline: groupRows + class gen (100 items, 3 col)', () => {
    const items = makeItems(100)
    const rows = groupItemsIntoRows(items, 3)
    for (const row of rows) {
      for (const _item of row) {
        getDescriptionsLabelClasses(true, 'md', 'horizontal')
        getDescriptionsContentClasses(true, 'md', 'horizontal')
      }
    }
  })
})
