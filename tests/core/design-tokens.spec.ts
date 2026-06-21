import { describe, expect, it } from 'vitest'
import {
  aliasTokens,
  componentTokens,
  designTokens,
  globalColors,
  primitiveColors,
  semanticTokens
} from '@expcat/tigercat-core'
import figmaVariables from '../../packages/core/tokens/figma-variables.json'

describe('design tokens', () => {
  it('exposes primitive, semantic, and component layers', () => {
    expect(designTokens.primitive.color.primary['600']).toBe('#0284c7')
    expect(designTokens.semantic.color['interactive-primary']).toBe('#0284c7')
    expect(designTokens.component.button['border-radius']).toBe('8px')
  })

  it('keeps legacy token exports as compatibility aliases', () => {
    expect(globalColors).toBe(primitiveColors)
    expect(aliasTokens).toBe(semanticTokens)
    expect(componentTokens.tag['border-radius']).toBe('6px')
    expect(componentTokens.table.bg).toBe('#fafafa')
  })

  it('generates Figma collections with token references', () => {
    const collections = figmaVariables.collections
    expect(collections.map((collection) => collection.name)).toEqual([
      'Tigercat Primitive',
      'Tigercat Semantic',
      'Tigercat Component'
    ])

    const semantic = collections.find((collection) => collection.name === 'Tigercat Semantic')
    const component = collections.find((collection) => collection.name === 'Tigercat Component')

    expect(
      semantic?.variables.find((variable) => variable.name === 'semantic/color/bg-primary')
        ?.reference
    ).toBe('primitive/color/primary/50')
    expect(
      component?.variables.find((variable) => variable.name === 'component/button/border-radius')
        ?.reference
    ).toBe('semantic/radius/component')
    expect(
      component?.variables.find((variable) => variable.name === 'component/table/bg')?.reference
    ).toBe('semantic/color/bg-surface')
  })
})
