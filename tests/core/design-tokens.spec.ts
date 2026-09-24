import { describe, expect, it } from 'vitest'
import {
  defaultTheme,
  designTokens,
  primitiveColors,
  runtimeBreakpoints,
  runtimeThemeDark,
  runtimeThemeLight,
  semanticTokens
} from '@expcat/tigercat-core'
import figmaVariables from '../../packages/core/tokens/figma-variables.json'

describe('design tokens', () => {
  it('exposes primitive and semantic layers from one source', () => {
    expect(designTokens.primitive.color.primary['600']).toBe('#2563eb')
    expect(designTokens.semantic.color['interactive-primary']).toBe('#2563eb')
    expect('component' in designTokens).toBe(false)
    expect(runtimeBreakpoints['2xl']).toBe('1536px')
  })

  it('exposes canonical token registries without a second component registry', () => {
    expect(primitiveColors.primary['600']).toBe('#2563eb')
    expect(semanticTokens.color['focus-ring']).toBe('#2563eb')
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
      'Tigercat Semantic'
    ])

    const semantic = collections.find((collection) => collection.name === 'Tigercat Semantic')
    expect(
      semantic?.variables.find((variable) => variable.name === 'semantic/color/bg-primary')
        ?.reference
    ).toBe('primitive/color/primary/50')
  })
})
