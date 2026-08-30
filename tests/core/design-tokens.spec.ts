import { describe, expect, it } from 'vitest'
import {
  componentTokens,
  defaultTheme,
  designTokens,
  primitiveColors,
  runtimeThemeDark,
  runtimeThemeLight,
  semanticTokens
} from '@expcat/tigercat-core'
import figmaVariables from '../../packages/core/tokens/figma-variables.json'

describe('design tokens', () => {
  it('exposes primitive, semantic, and component layers', () => {
    expect(designTokens.primitive.color.primary['600']).toBe('#2563eb')
    expect(designTokens.semantic.color['interactive-primary']).toBe('#2563eb')
    expect(designTokens.component.button['border-radius']).toBe('10px')
  })

  it('exposes canonical token registries without compatibility aliases', () => {
    expect(primitiveColors.primary['600']).toBe('#2563eb')
    expect(semanticTokens.color['focus-ring']).toBe('#2563eb')
    expect(componentTokens.tag['border-radius']).toBe('6px')
    expect(componentTokens.table.bg).toBe('#fafafa')
  })

  it('drives the default runtime theme from the same tokens.json palette', () => {
    expect(runtimeThemeLight.colors.primary).toBe('#2563eb')
    expect(runtimeThemeLight.colors.primary).toBe(primitiveColors.primary['600'])
    expect(runtimeThemeLight.colors.primary).toBe(defaultTheme.light.colors?.primary)
    expect(runtimeThemeDark.colors.primary).toBe('#60a5fa')
    expect(runtimeThemeDark.colors.primary).toBe(defaultTheme.dark.colors?.primary)
    expect(runtimeThemeLight.radius.md).toBe(defaultTheme.light.radius?.md)
    expect(runtimeThemeDark.radius.md).toBe(defaultTheme.dark.radius?.md)
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
