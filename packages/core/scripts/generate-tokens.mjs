#!/usr/bin/env node

/**
 * Token generator — reads tokens.json and outputs:
 *   tokens.css  — layered tokens plus runtime --tiger-* aliases
 *   tokens.ts   — TypeScript constants, including the default runtime theme
 *   figma-variables.json — Figma Variables import data
 *
 * Usage:  node packages/core/scripts/generate-tokens.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { format, resolveConfig } from 'prettier'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TOKENS_DIR = join(__dirname, '..', 'tokens')
const SRC_TOKENS_DIR = join(__dirname, '..', 'src', 'tokens')
const CHECK_MODE = process.argv.includes('--check')
const rawTokens = JSON.parse(readFileSync(join(TOKENS_DIR, 'tokens.json'), 'utf-8'))
const primitiveTokens = rawTokens.primitive ?? rawTokens.global
const semanticTokens = rawTokens.semantic ?? rawTokens.alias
const componentTokens = rawTokens.component
const runtimeTokens = rawTokens.runtime
const tokens = {
  primitive: primitiveTokens,
  semantic: semanticTokens,
  component: componentTokens,
  runtime: runtimeTokens
}

/** Runtime ThemeConfig color keys → CSS custom properties components actually read. */
const RUNTIME_COLOR_CSS_VARS = {
  primary: '--tiger-primary',
  primaryHover: '--tiger-primary-hover',
  primaryActive: '--tiger-primary-active',
  primaryDisabled: '--tiger-primary-disabled',
  primaryForeground: '--tiger-primary-foreground',
  secondary: '--tiger-secondary',
  secondaryHover: '--tiger-secondary-hover',
  secondaryActive: '--tiger-secondary-active',
  secondaryDisabled: '--tiger-secondary-disabled',
  secondaryForeground: '--tiger-secondary-foreground',
  outlineBgHover: '--tiger-outline-bg-hover',
  ghostBgHover: '--tiger-ghost-bg-hover',
  focusRing: '--tiger-focus-ring',
  surface: '--tiger-surface',
  surfaceMuted: '--tiger-surface-muted',
  surfaceRaised: '--tiger-surface-raised',
  text: '--tiger-text',
  textSecondary: '--tiger-text-secondary',
  textDisabled: '--tiger-text-disabled',
  border: '--tiger-border',
  borderStrong: '--tiger-border-strong',
  success: '--tiger-success',
  warning: '--tiger-warning',
  error: '--tiger-error',
  errorForeground: '--tiger-error-foreground',
  errorHover: '--tiger-error-hover',
  errorDisabled: '--tiger-error-disabled',
  errorBgHover: '--tiger-error-bg-hover',
  info: '--tiger-info',
  chart1: '--tiger-chart-1',
  chart2: '--tiger-chart-2',
  chart3: '--tiger-chart-3',
  chart4: '--tiger-chart-4',
  chart5: '--tiger-chart-5',
  chart6: '--tiger-chart-6'
}

const RUNTIME_SECTION_CSS_VARS = {
  typography: {
    fontFamily: '--tiger-font-family',
    fontFamilyMono: '--tiger-font-family-mono',
    fontSizeBase: '--tiger-font-size-base',
    fontSizeSm: '--tiger-font-size-sm',
    fontSizeLg: '--tiger-font-size-lg',
    fontWeightNormal: '--tiger-font-weight-normal',
    fontWeightMedium: '--tiger-font-weight-medium',
    fontWeightSemibold: '--tiger-font-weight-semibold',
    fontWeightBold: '--tiger-font-weight-bold',
    lineHeightNormal: '--tiger-line-height-normal',
    lineHeightTight: '--tiger-line-height-tight'
  },
  radius: {
    none: '--tiger-radius-none',
    sm: '--tiger-radius-sm',
    md: '--tiger-radius-md',
    lg: '--tiger-radius-lg',
    xl: '--tiger-radius-xl',
    full: '--tiger-radius-full'
  },
  shadows: {
    xs: '--tiger-shadow-xs',
    sm: '--tiger-shadow-sm',
    md: '--tiger-shadow-md',
    lg: '--tiger-shadow-lg',
    xl: '--tiger-shadow-xl'
  },
  spacing: {
    xs: '--tiger-spacing-xs',
    sm: '--tiger-spacing-sm',
    md: '--tiger-spacing-md',
    lg: '--tiger-spacing-lg',
    xl: '--tiger-spacing-xl'
  },
  motion: {
    durationFast: '--tiger-motion-duration-quick',
    durationBase: '--tiger-motion-duration-base',
    durationSlow: '--tiger-motion-duration-relaxed',
    easing: '--tiger-motion-ease-standard'
  }
}

const RUNTIME_COLOR_ALIASES = {
  '--tiger-text-muted': '--tiger-text-secondary',
  '--tiger-fill': '--tiger-surface-muted',
  '--tiger-bg': '--tiger-surface'
}

const RUNTIME_BREAKPOINT_CSS_VARS = {
  xs: '--tiger-breakpoint-xs',
  sm: '--tiger-breakpoint-sm',
  md: '--tiger-breakpoint-md',
  lg: '--tiger-breakpoint-lg',
  xl: '--tiger-breakpoint-xl'
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalize legacy references while keeping pre-9.1 token sources readable. */
function normalizeReference(ref) {
  if (typeof ref !== 'string') return ref
  if (ref.startsWith('global.')) return ref.replace(/^global\./, 'primitive.')
  if (ref.startsWith('alias.')) return ref.replace(/^alias\./, 'semantic.')
  return ref
}

/** Resolve a reference like "primitive.color.primary.500" to its concrete value */
function resolve(ref, root = tokens) {
  const normalized = normalizeReference(ref)
  if (
    typeof normalized !== 'string' ||
    (!normalized.startsWith('primitive.') &&
      !normalized.startsWith('semantic.') &&
      !normalized.startsWith('component.'))
  ) {
    return ref
  }

  const parts = normalized.split('.')
  let cur = root
  for (const p of parts) {
    cur = cur?.[p]
    if (cur === undefined) return ref // unresolvable — keep as-is
  }
  // Recurse in case the token itself points to another token
  return typeof cur === 'string' &&
    (cur.startsWith('primitive.') ||
      cur.startsWith('semantic.') ||
      cur.startsWith('component.') ||
      cur.startsWith('global.') ||
      cur.startsWith('alias.'))
    ? resolve(cur, root)
    : cur
}

function canonicalCssVarName(layer, category, ...parts) {
  return `--tiger-${layer}-${category}-${parts.join('-')}`
}

function componentCssVarName(component, tokenName) {
  return `--tiger-component-${component}-${tokenName}`
}

function tokenPathToName(path) {
  return path.join('/')
}

function resolveRuntimeValue(value) {
  return resolve(value)
}

function resolveRuntimeConfig(scheme) {
  const source = tokens.runtime?.[scheme]
  if (!source) return null
  const resolved = {}
  for (const [section, entries] of Object.entries(source)) {
    resolved[section] = Object.fromEntries(
      Object.entries(entries).map(([key, value]) => [key, resolveRuntimeValue(value)])
    )
  }
  return resolved
}

function collectRuntimeCssVars(schemeConfig) {
  const vars = {}
  if (!schemeConfig) return vars

  if (schemeConfig.colors) {
    for (const [key, value] of Object.entries(schemeConfig.colors)) {
      const varName = RUNTIME_COLOR_CSS_VARS[key]
      if (varName && value) vars[varName] = value
    }
  }

  for (const [aliasName, sourceName] of Object.entries(RUNTIME_COLOR_ALIASES)) {
    vars[aliasName] = `var(${sourceName})`
  }

  for (const section of ['typography', 'radius', 'shadows', 'spacing', 'motion']) {
    const values = schemeConfig[section]
    const varNames = RUNTIME_SECTION_CSS_VARS[section]
    if (!values || !varNames) continue
    for (const [key, value] of Object.entries(values)) {
      const varName = varNames[key]
      if (varName && value) vars[varName] = value
    }
  }

  const motion = schemeConfig.motion
  if (motion?.durationBase && motion?.easing) {
    vars['--tiger-transition-base'] = `all ${motion.durationBase} ${motion.easing}`
  }
  if (motion?.durationFast && motion?.easing) {
    vars['--tiger-transition-quick'] = `all ${motion.durationFast} ${motion.easing}`
  }
  if (motion?.durationSlow && motion?.easing) {
    vars['--tiger-transition-emphasized'] = `transform ${motion.durationSlow} ${motion.easing}`
  }

  const breakpoints = tokens.runtime?.breakpoints
  if (breakpoints) {
    for (const [key, value] of Object.entries(breakpoints)) {
      const varName = RUNTIME_BREAKPOINT_CSS_VARS[key]
      if (varName && value) vars[varName] = value
    }
  }

  return vars
}

function emitJsObject(value, indent = 0) {
  const pad = '  '.repeat(indent)
  const inner = '  '.repeat(indent + 1)
  if (value == null) return 'undefined'
  if (typeof value === 'string') return `'${value.replaceAll("'", "\\'")}'`
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    return `[\n${value.map((item) => `${inner}${emitJsObject(item, indent + 1)}`).join(',\n')}\n${pad}]`
  }
  const entries = Object.entries(value)
  if (entries.length === 0) return '{}'
  return `{\n${entries
    .map(([key, item]) => {
      const safeKey = /^[A-Za-z_$][\w$]*$/.test(key) ? key : `'${key}'`
      return `${inner}${safeKey}: ${emitJsObject(item, indent + 1)}`
    })
    .join(',\n')}\n${pad}}`
}

// 必须复用仓库 .prettierrc.json，不能手写子集：漏掉 printWidth 会让产物停在
// prettier 默认的 80 列，与 `pnpm format:check` 永久互相打架。
let prettierConfigPromise
async function formatGenerated(source, parser) {
  prettierConfigPromise ??= resolveConfig(TOKENS_DIR)
  const config = await prettierConfigPromise
  return format(source, { ...config, parser })
}

// ---------------------------------------------------------------------------
// 1. Generate CSS
// ---------------------------------------------------------------------------

function generateCSS() {
  const lines = [
    '/* Auto-generated by generate-tokens.mjs — Do not edit manually */',
    '',
    ':root {'
  ]
  lines.push('  color-scheme: light;')
  lines.push('')

  // Canonical layered tokens
  const { color, space, radius, shadow, font, duration, easing } = tokens.primitive

  lines.push('  /* Primitive tokens */')
  for (const [hue, shades] of Object.entries(color)) {
    for (const [level, value] of Object.entries(shades)) {
      lines.push(`  ${canonicalCssVarName('primitive', 'color', hue, level)}: ${value};`)
    }
  }
  for (const [key, value] of Object.entries(space)) {
    lines.push(`  ${canonicalCssVarName('primitive', 'space', key)}: ${value};`)
  }
  for (const [key, value] of Object.entries(radius)) {
    lines.push(`  ${canonicalCssVarName('primitive', 'radius', key)}: ${value};`)
  }
  for (const [key, value] of Object.entries(shadow)) {
    lines.push(`  ${canonicalCssVarName('primitive', 'shadow', key)}: ${value};`)
  }
  for (const [key, value] of Object.entries(font.family)) {
    lines.push(`  ${canonicalCssVarName('primitive', 'font-family', key)}: ${value};`)
  }
  for (const [key, value] of Object.entries(font.size)) {
    lines.push(`  ${canonicalCssVarName('primitive', 'font-size', key)}: ${value};`)
  }
  for (const [key, value] of Object.entries(font.weight)) {
    lines.push(`  ${canonicalCssVarName('primitive', 'font-weight', key)}: ${value};`)
  }
  for (const [key, value] of Object.entries(font.lineHeight)) {
    lines.push(`  ${canonicalCssVarName('primitive', 'font-lh', key)}: ${value};`)
  }
  for (const [key, value] of Object.entries(duration)) {
    lines.push(`  ${canonicalCssVarName('primitive', 'duration', key)}: ${value};`)
  }
  for (const [key, value] of Object.entries(easing)) {
    lines.push(`  ${canonicalCssVarName('primitive', 'easing', key)}: ${value};`)
  }

  lines.push('')
  lines.push('  /* Semantic tokens */')
  for (const [category, entries] of Object.entries(tokens.semantic)) {
    for (const [key, ref] of Object.entries(entries)) {
      lines.push(`  ${canonicalCssVarName('semantic', category, key)}: ${resolve(ref)};`)
    }
  }

  lines.push('')
  lines.push('  /* Component tokens */')
  for (const [comp, entries] of Object.entries(tokens.component)) {
    for (const [key, ref] of Object.entries(entries)) {
      lines.push(`  ${componentCssVarName(comp, key)}: ${resolve(ref)};`)
    }
  }

  const lightRuntime = collectRuntimeCssVars(resolveRuntimeConfig('light'))
  if (Object.keys(lightRuntime).length > 0) {
    lines.push('')
    lines.push('  /* Runtime aliases (component-facing --tiger-* names) */')
    for (const [name, value] of Object.entries(lightRuntime)) {
      lines.push(`  ${name}: ${value};`)
    }
  }

  lines.push('}')
  lines.push('')
  lines.push('.dark {')
  lines.push('  color-scheme: dark;')

  const darkRuntime = collectRuntimeCssVars(resolveRuntimeConfig('dark'))
  if (Object.keys(darkRuntime).length > 0) {
    lines.push('')
    lines.push('  /* Runtime aliases */')
    for (const [name, value] of Object.entries(darkRuntime)) {
      lines.push(`  ${name}: ${value};`)
    }
  }

  lines.push('}')
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// 2. Generate TypeScript
// ---------------------------------------------------------------------------

function generateTS() {
  const lines = ['/* Auto-generated by generate-tokens.mjs — Do not edit manually */', '']

  // Primitive color tokens
  lines.push('/** Primitive color tokens */')
  lines.push('export const primitiveColors = {')
  for (const [hue, shades] of Object.entries(tokens.primitive.color)) {
    lines.push(`  ${hue}: {`)
    for (const [level, value] of Object.entries(shades)) {
      lines.push(`    '${level}': '${value}',`)
    }
    lines.push('  },')
  }
  lines.push('} as const')
  lines.push('')

  // Space
  lines.push('/** Primitive spacing scale */')
  lines.push('export const primitiveSpace = {')
  for (const [key, value] of Object.entries(tokens.primitive.space)) {
    lines.push(`  '${key}': '${value}',`)
  }
  lines.push('} as const')
  lines.push('')

  // Radius
  lines.push('/** Primitive border radius scale */')
  lines.push('export const primitiveRadius = {')
  for (const [key, value] of Object.entries(tokens.primitive.radius)) {
    lines.push(`  ${key}: '${value}',`)
  }
  lines.push('} as const')
  lines.push('')

  // Shadow
  lines.push('/** Primitive box shadow scale */')
  lines.push('export const primitiveShadow = {')
  for (const [key, value] of Object.entries(tokens.primitive.shadow)) {
    lines.push(`  ${key}: '${value}',`)
  }
  lines.push('} as const')
  lines.push('')

  // Font
  lines.push('/** Primitive typography tokens */')
  lines.push('export const primitiveFont = {')
  lines.push('  family: {')
  for (const [key, value] of Object.entries(tokens.primitive.font.family)) {
    lines.push(`    ${key}: "${value}",`)
  }
  lines.push('  },')
  lines.push('  size: {')
  for (const [key, value] of Object.entries(tokens.primitive.font.size)) {
    lines.push(`    '${key}': '${value}',`)
  }
  lines.push('  },')
  lines.push('  weight: {')
  for (const [key, value] of Object.entries(tokens.primitive.font.weight)) {
    lines.push(`    ${key}: '${value}',`)
  }
  lines.push('  },')
  lines.push('  lineHeight: {')
  for (const [key, value] of Object.entries(tokens.primitive.font.lineHeight)) {
    lines.push(`    ${key}: '${value}',`)
  }
  lines.push('  },')
  lines.push('} as const')
  lines.push('')

  // Duration + easing
  lines.push('/** Primitive animation duration tokens */')
  lines.push('export const primitiveDuration = {')
  for (const [key, value] of Object.entries(tokens.primitive.duration)) {
    lines.push(`  ${key}: '${value}',`)
  }
  lines.push('} as const')
  lines.push('')
  lines.push('/** Primitive animation easing tokens */')
  lines.push('export const primitiveEasing = {')
  for (const [key, value] of Object.entries(tokens.primitive.easing)) {
    lines.push(`  '${key}': '${value}',`)
  }
  lines.push('} as const')
  lines.push('')

  // Semantic
  lines.push('/** Semantic tokens */')
  lines.push('export const semanticTokens = {')
  for (const [category, entries] of Object.entries(tokens.semantic)) {
    lines.push(`  ${category}: {`)
    for (const [key, ref] of Object.entries(entries)) {
      const resolved = resolve(ref)
      lines.push(`    '${key}': '${resolved}',`)
    }
    lines.push('  },')
  }
  lines.push('} as const')
  lines.push('')

  // Component
  lines.push('/** Component-level tokens */')
  lines.push('export const componentTokens = {')
  for (const [comp, entries] of Object.entries(tokens.component)) {
    lines.push(`  ${comp}: {`)
    for (const [key, ref] of Object.entries(entries)) {
      const resolved = resolve(ref)
      lines.push(`    '${key}': '${resolved}',`)
    }
    lines.push('  },')
  }
  lines.push('} as const')
  lines.push('')

  const lightRuntime = resolveRuntimeConfig('light')
  const darkRuntime = resolveRuntimeConfig('dark')
  if (lightRuntime) {
    lines.push('/** Default runtime theme (light). Source: tokens.json runtime.light */')
    lines.push(`export const runtimeThemeLight = ${emitJsObject(lightRuntime)} as const`)
    lines.push('')
  }
  if (darkRuntime) {
    lines.push('/** Default runtime theme (dark). Source: tokens.json runtime.dark */')
    lines.push(`export const runtimeThemeDark = ${emitJsObject(darkRuntime)} as const`)
    lines.push('')
  }

  lines.push('/** Complete three-layer design token registry */')
  lines.push('export const designTokens = {')
  lines.push('  primitive: {')
  lines.push('    color: primitiveColors,')
  lines.push('    space: primitiveSpace,')
  lines.push('    radius: primitiveRadius,')
  lines.push('    shadow: primitiveShadow,')
  lines.push('    font: primitiveFont,')
  lines.push('    duration: primitiveDuration,')
  lines.push('    easing: primitiveEasing')
  lines.push('  },')
  lines.push('  semantic: semanticTokens,')
  lines.push('  component: componentTokens')
  lines.push('} as const')
  lines.push('')

  // Convenience type exports
  lines.push('export type PrimitiveColorHue = keyof typeof primitiveColors')
  lines.push('export type PrimitiveColorLevel = keyof typeof primitiveColors[PrimitiveColorHue]')
  lines.push('export type PrimitiveSpaceKey = keyof typeof primitiveSpace')
  lines.push('export type PrimitiveRadiusKey = keyof typeof primitiveRadius')
  lines.push('export type PrimitiveShadowKey = keyof typeof primitiveShadow')
  lines.push('export type PrimitiveDurationKey = keyof typeof primitiveDuration')
  lines.push('export type PrimitiveEasingKey = keyof typeof primitiveEasing')
  lines.push('export type SemanticTokenCategory = keyof typeof semanticTokens')
  lines.push('export type ComponentTokenName = keyof typeof componentTokens')

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// 3. Generate Figma Variables JSON
// ---------------------------------------------------------------------------

function isColorValue(value) {
  return typeof value === 'string' && (/^#[0-9a-f]{3,8}$/i.test(value) || /^rgba?\(/i.test(value))
}

function parseHexColor(value) {
  const hex = value.replace('#', '')
  const expanded =
    hex.length === 3
      ? hex
          .split('')
          .map((part) => part + part)
          .join('')
      : hex
  const r = Number.parseInt(expanded.slice(0, 2), 16) / 255
  const g = Number.parseInt(expanded.slice(2, 4), 16) / 255
  const b = Number.parseInt(expanded.slice(4, 6), 16) / 255
  const a = expanded.length >= 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1
  return { r, g, b, a }
}

function parseRgbColor(value) {
  const parts = value
    .replace(/^rgba?\(/i, '')
    .replace(')', '')
    .split(',')
    .map((part) => part.trim())
  const [r, g, b, alpha] = parts
  return {
    r: Number.parseFloat(r) / 255,
    g: Number.parseFloat(g) / 255,
    b: Number.parseFloat(b) / 255,
    a: alpha === undefined ? 1 : Number.parseFloat(alpha)
  }
}

function toFigmaValue(value) {
  if (!isColorValue(value)) return value
  return value.startsWith('#') ? parseHexColor(value) : parseRgbColor(value)
}

function flattenTokenEntries(node, path = []) {
  const entries = []
  for (const [key, value] of Object.entries(node)) {
    const nextPath = [...path, key]
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      entries.push(...flattenTokenEntries(value, nextPath))
    } else {
      entries.push({ path: nextPath, value })
    }
  }
  return entries
}

function isTokenReference(value) {
  if (typeof value !== 'string') return false
  const normalized = normalizeReference(value)
  return (
    normalized.startsWith('primitive.') ||
    normalized.startsWith('semantic.') ||
    normalized.startsWith('component.')
  )
}

function referenceName(value) {
  if (!isTokenReference(value)) return undefined
  return normalizeReference(value).replaceAll('.', '/')
}

function cssVariableFor(layer, path) {
  if (layer === 'primitive') {
    return canonicalCssVarName('primitive', path[0], ...path.slice(1))
  }
  if (layer === 'semantic') {
    return canonicalCssVarName('semantic', path[0], ...path.slice(1))
  }
  return componentCssVarName(path[0], path.slice(1).join('-'))
}

function createFigmaVariable(layer, entry) {
  const resolved = resolve(entry.value)
  const type = isColorValue(resolved) ? 'COLOR' : 'STRING'
  const reference = referenceName(entry.value)
  return {
    name: tokenPathToName([layer, ...entry.path]),
    type,
    cssVariable: cssVariableFor(layer, entry.path),
    value: toFigmaValue(resolved),
    ...(reference ? { reference } : {})
  }
}

function createFigmaCollection(layer, label, source) {
  return {
    name: label,
    mode: 'Default',
    variables: flattenTokenEntries(source).map((entry) => createFigmaVariable(layer, entry))
  }
}

function generateFigmaVariables() {
  return `${JSON.stringify(
    {
      schemaVersion: '1.0.0',
      name: 'Tigercat Design Tokens',
      source: 'packages/core/tokens/tokens.json',
      collections: [
        createFigmaCollection('primitive', 'Tigercat Primitive', tokens.primitive),
        createFigmaCollection('semantic', 'Tigercat Semantic', tokens.semantic),
        createFigmaCollection('component', 'Tigercat Component', tokens.component)
      ]
    },
    null,
    2
  )}\n`
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const generatedOutputs = [
  {
    label: 'tokens.css',
    path: join(TOKENS_DIR, 'tokens.css'),
    content: await formatGenerated(generateCSS(), 'css')
  },
  {
    label: 'tokens.ts',
    path: join(SRC_TOKENS_DIR, 'tokens.ts'),
    content: await formatGenerated(generateTS(), 'typescript')
  },
  {
    label: 'figma-variables.json',
    path: join(TOKENS_DIR, 'figma-variables.json'),
    content: await formatGenerated(generateFigmaVariables(), 'json')
  }
]

if (CHECK_MODE) {
  const staleOutputs = []

  for (const output of generatedOutputs) {
    let actual
    try {
      actual = readFileSync(output.path, 'utf-8')
    } catch {
      staleOutputs.push(`${relative(process.cwd(), output.path)} (missing)`)
      continue
    }

    if (actual !== output.content) {
      staleOutputs.push(relative(process.cwd(), output.path))
    }
  }

  if (staleOutputs.length > 0) {
    console.error('Token outputs are out of date:')
    for (const outputPath of staleOutputs) {
      console.error(`- ${outputPath}`)
    }
    console.error('Run pnpm tokens:build to regenerate them.')
    process.exitCode = 1
  } else {
    console.log('✓ token outputs are up to date')
  }
} else {
  for (const output of generatedOutputs) {
    writeFileSync(output.path, output.content, 'utf-8')
    console.log(`✓ ${output.label} generated`)
  }
}
