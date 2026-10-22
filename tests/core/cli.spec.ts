import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { existsSync, mkdirSync, rmSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'

// Test templates
import { getVue3Template } from '@expcat/tigercat-cli/templates/vue3'
import { getReactTemplate } from '@expcat/tigercat-cli/templates/react'

// Test constants
import {
  ALL_COMPONENTS,
  TEMPLATES,
  COMPONENT_CATEGORIES,
  CLI_NAME,
  CLI_VERSION,
  TEMPLATE_VERSIONS
} from '@expcat/tigercat-cli/constants'

// Test utils
import { ensureDir, writeFileSafe, isDirEmpty, readFileSafe } from '@expcat/tigercat-cli/utils/fs'
import { runArgv } from '@expcat/tigercat-cli/utils/exec'
import { validateProjectName, suggestProjectName } from '@expcat/tigercat-cli/utils/validate'
import { runCreate } from '@expcat/tigercat-cli/commands/create'
import { runAdd } from '@expcat/tigercat-cli/commands/add'
import { runPlayground } from '@expcat/tigercat-cli/commands/playground'
import { runGenerateTest, runGenerateDocTemplate } from '@expcat/tigercat-cli/commands/generate'
import { rewriteSource } from '@expcat/tigercat-cli/commands/migrate'
import { collectDoctorChecks } from '@expcat/tigercat-cli/commands/doctor'

function readWorkspaceCatalogValue(packageName: string): string | undefined {
  const workspaceYaml = readFileSync(resolve(process.cwd(), 'pnpm-workspace.yaml'), 'utf-8')
  const escapedPackageName = packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`^\\s*['"]?${escapedPackageName}['"]?:\\s*(\\S+)`, 'm').exec(
    workspaceYaml
  )

  return match?.[1]
}

describe('CLI Constants', () => {
  it('should export correct CLI name and version', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), 'packages/cli/package.json'), 'utf-8')
    )

    expect(CLI_NAME).toBe('tigercat')
    expect(CLI_VERSION).toBe(packageJson.version)
  })

  it('should define supported templates', () => {
    expect(TEMPLATES).toEqual(['vue3', 'react'])
  })

  it('should have all component categories', () => {
    expect(Object.keys(COMPONENT_CATEGORIES)).toEqual(
      expect.arrayContaining([
        'basic',
        'form',
        'feedback',
        'layout',
        'navigation',
        'data',
        'charts'
      ])
    )
  })

  it('includes public components in the CLI catalog', () => {
    expect(ALL_COMPONENTS).toEqual(
      expect.arrayContaining([
        'Button',
        'Input',
        'Table',
        'BarChart',
        'AppShell',
        'AssigneePicker',
        'NotificationBell',
        'CopyButton',
        'Gallery',
        'Inplace',
        'SankeyChart',
        'WaterfallChart'
      ])
    )
  })

  it('should not have duplicate components', () => {
    const unique = new Set(ALL_COMPONENTS)
    expect(unique.size).toBe(ALL_COMPONENTS.length)
  })

  it('should point package entry fields at the tsup output files', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), 'packages/cli/package.json'), 'utf-8')
    )

    expect(packageJson.bin.tigercat).toBe('./dist/index.js')
    expect(packageJson.main).toBe('./dist/index.js')
    expect(packageJson.module).toBe('./dist/index.js')
    expect(packageJson.types).toBe('./dist/index.d.ts')
  })

  it('keeps the Tailwind v4 baseline aligned across workspace, templates, core and examples', () => {
    expect(readWorkspaceCatalogValue('tailwindcss')).toBe(TEMPLATE_VERSIONS.tailwindcss)
    expect(readWorkspaceCatalogValue('@tailwindcss/vite')).toBe(TEMPLATE_VERSIONS.tailwindcssVite)

    const vueTemplatePackage = JSON.parse(getVue3Template('vue-app')['package.json'])
    const reactTemplatePackage = JSON.parse(getReactTemplate('react-app')['package.json'])

    expect(vueTemplatePackage.devDependencies.tailwindcss).toBe(TEMPLATE_VERSIONS.tailwindcss)
    expect(vueTemplatePackage.devDependencies['@tailwindcss/vite']).toBe(
      TEMPLATE_VERSIONS.tailwindcssVite
    )
    expect(reactTemplatePackage.devDependencies.tailwindcss).toBe(TEMPLATE_VERSIONS.tailwindcss)
    expect(reactTemplatePackage.devDependencies['@tailwindcss/vite']).toBe(
      TEMPLATE_VERSIONS.tailwindcssVite
    )

    const corePackageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), 'packages/core/package.json'), 'utf-8')
    )
    expect(corePackageJson.peerDependencies.tailwindcss).toBe('^4.0.0')

    for (const packagePath of [
      'examples/example/react/package.json',
      'examples/example/vue3/package.json'
    ]) {
      const examplePackageJson = JSON.parse(
        readFileSync(resolve(process.cwd(), packagePath), 'utf-8')
      )

      expect(examplePackageJson.devDependencies.tailwindcss).toBe('catalog:')
      expect(examplePackageJson.devDependencies['@tailwindcss/vite']).toBe('catalog:')
    }
  })

  it('keeps every catalog-able template version aligned with the workspace catalog', () => {
    // TEMPLATE_VERSIONS is the single source for CLI templates; the catalog is the single
    // source for example/workspace deps. This guard turns silent drift into a red test.
    const templateVersionToCatalog: Record<string, string> = {
      vue: 'vue',
      react: 'react',
      reactDom: 'react-dom',
      typescript: 'typescript',
      vite: 'vite',
      tailwindcss: 'tailwindcss',
      tailwindcssVite: '@tailwindcss/vite',
      vitejsPluginVue: '@vitejs/plugin-vue',
      vitejsPluginReact: '@vitejs/plugin-react',
      typesReact: '@types/react',
      typesReactDom: '@types/react-dom',
      vueTsconfig: '@vue/tsconfig',
      vueTsc: 'vue-tsc'
    }

    for (const [versionKey, catalogName] of Object.entries(templateVersionToCatalog)) {
      expect(readWorkspaceCatalogValue(catalogName)).toBe(
        TEMPLATE_VERSIONS[versionKey as keyof typeof TEMPLATE_VERSIONS]
      )
    }
  })

  it('keeps shared template toolchain deps on the workspace catalog in example projects', () => {
    const reactExample = JSON.parse(
      readFileSync(resolve(process.cwd(), 'examples/example/react/package.json'), 'utf-8')
    )
    const vueExample = JSON.parse(
      readFileSync(resolve(process.cwd(), 'examples/example/vue3/package.json'), 'utf-8')
    )

    expect(reactExample.devDependencies['@vitejs/plugin-react']).toBe('catalog:')
    expect(vueExample.devDependencies['@vue/tsconfig']).toBe('catalog:')
    expect(vueExample.devDependencies['vue-tsc']).toBe('catalog:')
  })
})

describe('CLI Templates - Vue 3', () => {
  it('should generate all required files', () => {
    const files = getVue3Template('test-app')
    const fileNames = Object.keys(files)

    expect(fileNames).toContain('package.json')
    expect(fileNames).toContain('.gitignore')
    expect(fileNames).toContain('tsconfig.json')
    expect(fileNames).toContain('vite.config.ts')
    expect(fileNames).toContain('index.html')
    expect(fileNames).toContain('src/main.ts')
    expect(fileNames).toContain('src/App.vue')
    expect(fileNames).toContain('src/style.css')
    expect(fileNames).toContain('src/env.d.ts')
  })

  it('should use project name in package.json', () => {
    const files = getVue3Template('my-project')
    const pkg = JSON.parse(files['package.json'])
    const rootPackage = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8'))
    expect(pkg.name).toBe('my-project')
    expect(pkg.packageManager).toBe(rootPackage.packageManager)
    expect(files['.gitignore']).toContain('.tigercat-playground')
    expect(files['.gitignore']).toContain('node_modules')
  })

  it('should include @expcat/tigercat-vue dependency', () => {
    const files = getVue3Template('test')
    const pkg = JSON.parse(files['package.json'])
    expect(pkg.dependencies).toHaveProperty('@expcat/tigercat-vue')
  })

  it('should include vue dependency', () => {
    const files = getVue3Template('test')
    const pkg = JSON.parse(files['package.json'])
    expect(pkg.dependencies).toHaveProperty('vue')
  })

  it('should have tailwind and vite in devDependencies', () => {
    const files = getVue3Template('test')
    const pkg = JSON.parse(files['package.json'])
    expect(pkg.devDependencies).toHaveProperty('tailwindcss')
    expect(pkg.devDependencies).toHaveProperty('vite')
    expect(pkg.devDependencies).toHaveProperty('@vitejs/plugin-vue')
    expect(pkg.devDependencies.tailwindcss).toMatch(/^\^4\./)
    expect(pkg.devDependencies['@tailwindcss/vite']).toMatch(/^\^4\./)
  })

  it('should wire Tailwind v4 through the Vite plugin and CSS plugin entry', () => {
    const files = getVue3Template('test')

    expect(files['vite.config.ts']).toContain("from '@tailwindcss/vite'")
    expect(files['vite.config.ts']).toContain('tailwindcss()')
    expect(files['src/style.css']).toContain('@import "tailwindcss"')
    expect(files['src/style.css']).toContain('@plugin "@expcat/tigercat-core/tailwind";')
    expect(files['src/style.css']).not.toContain('tailwind/modern')
  })

  it('should have dev/build/preview scripts', () => {
    const files = getVue3Template('test')
    const pkg = JSON.parse(files['package.json'])
    expect(pkg.scripts).toHaveProperty('dev')
    expect(pkg.scripts).toHaveProperty('build')
    expect(pkg.scripts).toHaveProperty('preview')
  })

  it('should use project name in index.html title', () => {
    const files = getVue3Template('awesome-app')
    expect(files['index.html']).toContain('<title>awesome-app</title>')
  })

  it('should import tigercat-vue in App.vue', () => {
    const files = getVue3Template('test')
    expect(files['src/App.vue']).toContain("from '@expcat/tigercat-vue'")
    expect(files['src/App.vue']).toContain(':model-value=')
    expect(files['src/App.vue']).toContain('@update:model-value=')
    expect(files['src/App.vue']).not.toContain('@update:checked=')
  })

  it('should include CSS variables for theming', () => {
    const files = getVue3Template('test')
    // Tigercat v1+ templates load the tailwind plugin via @plugin which
    // injects every --tiger-* design token at build time.
    expect(files['src/style.css']).toContain('@plugin')
    expect(files['src/style.css']).toContain('@expcat/tigercat-core/tailwind')
  })

  it('should have dark mode support in styles', () => {
    const files = getVue3Template('test')
    // Class-driven dark mode keeps Tailwind variants, tokens, and native controls aligned.
    expect(files['src/style.css']).toContain('@custom-variant dark')
    expect(files['src/style.css']).toContain('color-scheme: light')
    expect(files['src/style.css']).toContain('html.dark')
    expect(files['src/style.css']).toContain('color-scheme: dark')
  })

  it('should have proper TypeScript config', () => {
    const files = getVue3Template('test')
    const tsconfig = JSON.parse(files['tsconfig.json'])
    expect(tsconfig.compilerOptions.strict).toBe(true)
    expect(tsconfig.compilerOptions.jsx).toBe('preserve')
  })
})

describe('CLI Templates - React', () => {
  it('should generate all required files', () => {
    const files = getReactTemplate('test-app')
    const fileNames = Object.keys(files)

    expect(fileNames).toContain('package.json')
    expect(fileNames).toContain('.gitignore')
    expect(fileNames).toContain('tsconfig.json')
    expect(fileNames).toContain('tsconfig.node.json')
    expect(fileNames).toContain('vite.config.ts')
    expect(fileNames).toContain('index.html')
    expect(fileNames).toContain('src/main.tsx')
    expect(fileNames).toContain('src/App.tsx')
    expect(fileNames).toContain('src/style.css')
  })

  it('should use project name in package.json', () => {
    const files = getReactTemplate('my-react-app')
    const pkg = JSON.parse(files['package.json'])
    expect(pkg.name).toBe('my-react-app')
  })

  it('should include @expcat/tigercat-react dependency', () => {
    const files = getReactTemplate('test')
    const pkg = JSON.parse(files['package.json'])
    expect(pkg.dependencies).toHaveProperty('@expcat/tigercat-react')
  })

  it('should include react and react-dom dependencies', () => {
    const files = getReactTemplate('test')
    const pkg = JSON.parse(files['package.json'])
    expect(pkg.dependencies).toHaveProperty('react')
    expect(pkg.dependencies).toHaveProperty('react-dom')
  })

  it('should have tailwind and vite in devDependencies', () => {
    const files = getReactTemplate('test')
    const pkg = JSON.parse(files['package.json'])
    expect(pkg.devDependencies).toHaveProperty('tailwindcss')
    expect(pkg.devDependencies).toHaveProperty('vite')
    expect(pkg.devDependencies).toHaveProperty('@vitejs/plugin-react')
    expect(pkg.devDependencies.tailwindcss).toMatch(/^\^4\./)
    expect(pkg.devDependencies['@tailwindcss/vite']).toMatch(/^\^4\./)
  })

  it('should wire Tailwind v4 through the Vite plugin and CSS plugin entry', () => {
    const files = getReactTemplate('test')

    expect(files['vite.config.ts']).toContain("from '@tailwindcss/vite'")
    expect(files['vite.config.ts']).toContain('tailwindcss()')
    expect(files['src/style.css']).toContain('@import "tailwindcss"')
    expect(files['src/style.css']).toContain('@plugin "@expcat/tigercat-core/tailwind";')
    expect(files['src/style.css']).not.toContain('tailwind/modern')
    expect(files['src/style.css']).toContain('@custom-variant dark')
    expect(files['src/style.css']).toContain('html.dark')
  })

  it('should import tigercat-react in App.tsx', () => {
    const files = getReactTemplate('test')
    expect(files['src/App.tsx']).toContain("from '@expcat/tigercat-react'")
  })

  it('should use jsx: react-jsx in tsconfig', () => {
    const files = getReactTemplate('test')
    const tsconfig = JSON.parse(files['tsconfig.json'])
    expect(tsconfig.compilerOptions.jsx).toBe('react-jsx')
  })

  it('should mount to #root element', () => {
    const files = getReactTemplate('test')
    expect(files['index.html']).toContain('id="root"')
    expect(files['src/main.tsx']).toContain("getElementById('root')")
  })

  it('should use StrictMode in main.tsx', () => {
    const files = getReactTemplate('test')
    expect(files['src/main.tsx']).toContain('StrictMode')
  })
})

describe('CLI Utils - File System', () => {
  const testDir = join(tmpdir(), `tigercat-cli-test-${Date.now()}`)

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('ensureDir should create nested directories', () => {
    const nested = join(testDir, 'a', 'b', 'c')
    ensureDir(nested)
    expect(existsSync(nested)).toBe(true)
  })

  it('writeFileSafe should create file with content', () => {
    const filePath = join(testDir, 'test.txt')
    writeFileSafe(filePath, 'hello')
    expect(readFileSync(filePath, 'utf-8')).toBe('hello')
  })

  it('writeFileSafe should create parent directories', () => {
    const filePath = join(testDir, 'sub', 'dir', 'test.txt')
    writeFileSafe(filePath, 'nested')
    expect(readFileSync(filePath, 'utf-8')).toBe('nested')
  })

  it('isDirEmpty should return true for non-existent directory', () => {
    expect(isDirEmpty(join(testDir, 'nope'))).toBe(true)
  })

  it('isDirEmpty should return true for empty directory', () => {
    mkdirSync(testDir, { recursive: true })
    expect(isDirEmpty(testDir)).toBe(true)
  })

  it('isDirEmpty should return false for non-empty directory', () => {
    writeFileSafe(join(testDir, 'file.txt'), 'content')
    expect(isDirEmpty(testDir)).toBe(false)
  })

  it('readFileSafe should return null for non-existent file', () => {
    expect(readFileSafe(join(testDir, 'nope.txt'))).toBeNull()
  })

  it('readFileSafe should return file content', () => {
    writeFileSafe(join(testDir, 'read.txt'), 'read me')
    expect(readFileSafe(join(testDir, 'read.txt'))).toBe('read me')
  })
})

describe('CLI Doctor', () => {
  const testDir = join(tmpdir(), `tigercat-doctor-test-${Date.now()}`)

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  function writePackage(projectName: string, pkg: Record<string, unknown>) {
    const projectDir = join(testDir, projectName)
    ensureDir(projectDir)
    writeFileSafe(join(projectDir, 'package.json'), JSON.stringify(pkg, null, 2))
    return projectDir
  }

  it('passes for a current React template-style project', () => {
    const projectDir = writePackage('react-pass', {
      packageManager: 'pnpm@11.9.0',
      dependencies: {
        '@expcat/tigercat-react': '^3.0.0-preview.1',
        react: '^19.2.7',
        'react-dom': '^19.2.7'
      },
      devDependencies: {
        '@expcat/tigercat-core': '^3.0.0-preview.1',
        '@tailwindcss/vite': '^4.3.1',
        '@vitejs/plugin-react': '^6.0.3',
        tailwindcss: '^4.3.1',
        typescript: '^6.0.3',
        vite: '^8.1.0'
      }
    })

    const checks = collectDoctorChecks({ cwd: projectDir, nodeVersion: '22.23.1', env: {} })

    expect(checks.every((check) => check.status === 'pass')).toBe(true)
  })

  it('fails when Node and pnpm are too old', () => {
    const projectDir = writePackage('old-toolchain', {
      packageManager: 'pnpm@7.33.0',
      dependencies: {
        '@expcat/tigercat-vue': '^1.0.0',
        vue: '^3.5.26'
      },
      devDependencies: {
        '@expcat/tigercat-core': '^1.0.0',
        '@tailwindcss/vite': '^4.3.1',
        '@vitejs/plugin-vue': '^6.0.7',
        tailwindcss: '^4.3.1',
        typescript: '^6.0.3',
        vite: '^8.1.0',
        'vue-tsc': '^3.3.5'
      }
    })

    const checks = collectDoctorChecks({ cwd: projectDir, nodeVersion: '16.20.2', env: {} })
    const failedNames = checks.filter((check) => check.status === 'fail').map((check) => check.name)

    expect(failedNames).toEqual(expect.arrayContaining(['Node.js', 'pnpm']))
    expect(failedNames).not.toContain('Tailwind CSS')
  })

  it('fails when the Tailwind v4 Vite plugin is missing', () => {
    const projectDir = writePackage('missing-tailwind-vite-plugin', {
      packageManager: 'pnpm@11.9.0',
      dependencies: {
        '@expcat/tigercat-vue': '^1.0.0',
        vue: '^3.5.26'
      },
      devDependencies: {
        '@expcat/tigercat-core': '^1.0.0',
        '@vitejs/plugin-vue': '^6.0.7',
        tailwindcss: '^4.3.1',
        typescript: '^6.0.3',
        vite: '^8.1.0',
        'vue-tsc': '^3.3.5'
      }
    })

    const checks = collectDoctorChecks({ cwd: projectDir, nodeVersion: '22.23.1', env: {} })
    const tailwindCheck = checks.find((check) => check.name === 'Tailwind CSS')

    expect(tailwindCheck?.status).toBe('fail')
    expect(tailwindCheck?.message).toContain('@tailwindcss/vite is required')
  })

  it('warns when a supported framework is not detected', () => {
    const projectDir = writePackage('plain-vite', {
      packageManager: 'pnpm@11.9.0',
      devDependencies: {
        '@tailwindcss/vite': '^4.1.18',
        tailwindcss: '^4.1.18',
        typescript: '^5.9.3',
        vite: '^7.3.0'
      }
    })

    const checks = collectDoctorChecks({ cwd: projectDir, nodeVersion: '22.23.1', env: {} })

    expect(checks.find((check) => check.name === 'Peer dependencies')?.status).toBe('warn')
    expect(checks.find((check) => check.name === 'Template compatibility')?.status).toBe('warn')
  })

  it('detects pnpm from the npm user agent when packageManager is absent', () => {
    const projectDir = writePackage('pnpm-agent', {
      dependencies: {
        '@expcat/tigercat-vue': '^1.0.0',
        vue: '^3.5.26'
      },
      devDependencies: {
        '@expcat/tigercat-core': '^1.0.0',
        '@tailwindcss/vite': '^4.1.18',
        '@vitejs/plugin-vue': '^6.0.7',
        tailwindcss: '^4.1.18',
        typescript: '^5.9.3',
        vite: '^7.3.0',
        'vue-tsc': '^2.2.0'
      }
    })

    const checks = collectDoctorChecks({
      cwd: projectDir,
      nodeVersion: '22.23.1',
      env: { npm_config_user_agent: 'pnpm/11.9.0 npm/? node/v22.23.1 darwin arm64' }
    })

    expect(checks.find((check) => check.name === 'pnpm')?.status).toBe('pass')
  })

  it('fails when package.json is invalid', () => {
    const projectDir = join(testDir, 'invalid-package')
    ensureDir(projectDir)
    writeFileSafe(join(projectDir, 'package.json'), '{ nope')

    const checks = collectDoctorChecks({ cwd: projectDir, nodeVersion: '22.23.1', env: {} })

    expect(checks.find((check) => check.name === 'Project package')?.status).toBe('fail')
    expect(checks.some((check) => check.name === 'Tailwind CSS')).toBe(false)
  })
})

describe('CLI Validate - project name', () => {
  it('accepts valid npm package names', () => {
    expect(validateProjectName('my-app')).toBeNull()
    expect(validateProjectName('@scope/my-app')).toBeNull()
    expect(validateProjectName('app_1.2')).toBeNull()
  })

  it('rejects invalid project names with a message', () => {
    expect(validateProjectName('')).toBeTruthy()
    expect(validateProjectName(' leading')).toBeTruthy()
    expect(validateProjectName('Bad Name')).toBeTruthy()
    expect(validateProjectName('UPPER')).toBeTruthy()
  })

  it('suggests a valid npm package name', () => {
    expect(suggestProjectName('Bad Name')).toBe('bad-name')
    expect(suggestProjectName('  My App!! ')).toBe('my-app')
    expect(suggestProjectName('@Scope/My App')).toBe('@scope/my-app')
  })
})

describe('CLI Argument validation', () => {
  const originalCwd = process.cwd()
  const testDir = join(tmpdir(), `tigercat-arg-validate-${Date.now()}`)
  let logSpy: ReturnType<typeof vi.spyOn>
  let errSpy: ReturnType<typeof vi.spyOn>
  let exitSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    ensureDir(testDir)
    process.chdir(testDir)
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit:${code}`)
    }) as never)
  })

  afterEach(() => {
    logSpy.mockRestore()
    errSpy.mockRestore()
    exitSpy.mockRestore()
    process.chdir(originalCwd)
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('create fails fast on an invalid project name and writes nothing', async () => {
    await expect(runCreate('Bad Name', 'vue3')).rejects.toThrow('process.exit:1')
    expect(existsSync(join(testDir, 'Bad Name'))).toBe(false)
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('bad-name'))
  })

  it('create fails fast on an invalid template instead of prompting', async () => {
    await expect(runCreate('valid-app', 'svelte')).rejects.toThrow('process.exit:1')
    expect(existsSync(join(testDir, 'valid-app'))).toBe(false)
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid template'))
  })

  it('add fails fast on an invalid framework instead of auto-detecting', async () => {
    writeFileSafe(
      join(testDir, 'package.json'),
      JSON.stringify({ dependencies: { '@expcat/tigercat-react': '^1.0.0' } })
    )
    await expect(runAdd(['Button'], { framework: 'angular' })).rejects.toThrow('process.exit:1')
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid framework'))
  })
})

describe('CLI Doctor - deep checks', () => {
  const testDir = join(tmpdir(), `tigercat-doctor-deep-${Date.now()}`)

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  function writeProject(name: string, pkg: Record<string, unknown>) {
    const projectDir = join(testDir, name)
    ensureDir(projectDir)
    writeFileSafe(join(projectDir, 'package.json'), JSON.stringify(pkg, null, 2))
    return projectDir
  }

  const requiredCoreExportKeys = JSON.parse(
    readFileSync(join(process.cwd(), 'packages/cli/src/required-core-exports.json'), 'utf8')
  )
  const REQUIRED_CORE_EXPORTS = Object.fromEntries(
    requiredCoreExportKeys.map((key) => [key, './dist/placeholder.js'])
  )

  it('fails the compatibility matrix when a framework is below the supported major', () => {
    const projectDir = writeProject('old-react', {
      packageManager: 'pnpm@11.9.0',
      dependencies: {
        '@expcat/tigercat-react': '^1.0.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        '@expcat/tigercat-core': '^1.0.0',
        '@tailwindcss/vite': '^4.3.1',
        '@vitejs/plugin-react': '^6.0.3',
        tailwindcss: '^4.3.1',
        typescript: '^6.0.3',
        vite: '^8.1.0'
      }
    })

    const checks = collectDoctorChecks({
      cwd: projectDir,
      nodeVersion: '22.23.1',
      env: {},
      readCorePackageJson: () => ({ exports: REQUIRED_CORE_EXPORTS })
    })
    const matrix = checks.find((check) => check.name === 'Version compatibility matrix')

    expect(matrix?.status).toBe('fail')
    expect(matrix?.details?.some((detail) => detail.includes('react@^18.2.0'))).toBe(true)
  })

  it('flags missing core export subpaths', () => {
    const projectDir = writeProject('broken-core', {
      dependencies: {
        '@expcat/tigercat-react': '^1.0.0',
        react: '^19.2.7',
        'react-dom': '^19.2.7'
      },
      devDependencies: { '@expcat/tigercat-core': '^1.0.0' }
    })

    const checks = collectDoctorChecks({
      cwd: projectDir,
      nodeVersion: '22.23.1',
      env: {},
      readCorePackageJson: () => ({
        exports: { '.': './dist/index.js', './tailwind': './dist/tailwind.js' }
      })
    })
    const coreCheck = checks.find((check) => check.name === 'Core exports')

    expect(coreCheck?.status).toBe('fail')
    expect(coreCheck?.details?.some((detail) => detail.includes('./tokens.css'))).toBe(true)
  })

  it('passes core exports when every required subpath is present', () => {
    const projectDir = writeProject('good-core', {
      dependencies: { '@expcat/tigercat-core': '^1.0.0' }
    })

    const checks = collectDoctorChecks({
      cwd: projectDir,
      nodeVersion: '22.23.1',
      env: {},
      readCorePackageJson: () => ({ exports: REQUIRED_CORE_EXPORTS })
    })

    expect(checks.find((check) => check.name === 'Core exports')?.status).toBe('pass')
  })

  it('skips the core exports check when core cannot be resolved', () => {
    const projectDir = writeProject('uninstalled-core', {
      dependencies: { '@expcat/tigercat-core': '^1.0.0' }
    })

    const checks = collectDoctorChecks({
      cwd: projectDir,
      nodeVersion: '22.23.1',
      env: {},
      readCorePackageJson: () => null
    })

    expect(checks.find((check) => check.name === 'Core exports')).toBeUndefined()
  })
})

describe('CLI Dry Run', () => {
  const originalCwd = process.cwd()
  const testDir = join(tmpdir(), `tigercat-dry-run-test-${Date.now()}`)
  let logSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    ensureDir(testDir)
    process.chdir(testDir)
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
  })

  afterEach(() => {
    logSpy.mockRestore()
    process.chdir(originalCwd)
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('previews create without writing project files', async () => {
    await runCreate('dry-vue', 'vue3', true)

    expect(existsSync(join(testDir, 'dry-vue'))).toBe(false)
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Dry run'))
  })

  it('previews add without writing demo files', async () => {
    writeFileSafe(
      join(testDir, 'package.json'),
      JSON.stringify({ dependencies: { '@expcat/tigercat-react': '^1.0.0' } })
    )
    ensureDir(join(testDir, 'src/components'))

    await runAdd(['Button'], { dryRun: true })

    expect(existsSync(join(testDir, 'src/components/ButtonDemo.tsx'))).toBe(false)
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Dry run'))
  })

  it('previews playground without creating the temporary project', async () => {
    await runPlayground('react', '3457', true, true)

    expect(existsSync(join(testDir, '.tigercat-playground'))).toBe(false)
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Would start Vite on port 3457'))
  })

  it('previews a lock refresh when the playground directory already exists', async () => {
    const projectDir = join(testDir, '.tigercat-playground', 'playground-react')
    ensureDir(projectDir)
    writeFileSafe(join(projectDir, 'package.json'), '{"name":"stale"}')

    await runPlayground('react', '3457', false, true)

    expect(readFileSync(join(projectDir, 'package.json'), 'utf-8')).toBe('{"name":"stale"}')
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('dependency lock'))
  })
})

describe('CLI Generate - existing files', () => {
  const originalCwd = process.cwd()
  const testDir = join(tmpdir(), `tigercat-generate-existing-test-${Date.now()}`)
  let logSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    ensureDir(testDir)
    process.chdir(testDir)
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
  })

  afterEach(() => {
    logSpy.mockRestore()
    process.chdir(originalCwd)
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('refuses to generate a test outside the project', async () => {
    await expect(runGenerateTest('Button', 'vue3', '../outside-tests')).rejects.toThrow(
      'Refusing to write outside the project'
    )
    expect(existsSync(resolve(testDir, '../outside-tests'))).toBe(false)
  })

  it('skips generate test when target spec already exists without crashing', async () => {
    const specPath = join(testDir, 'tests', 'vue', 'Button.spec.ts')
    writeFileSafe(specPath, '// existing spec, must not be overwritten')

    await expect(runGenerateTest('Button', 'vue3', 'tests')).resolves.toBeUndefined()

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('already exists'))
    expect(readFileSync(specPath, 'utf-8')).toBe('// existing spec, must not be overwritten')
  })

  it('skips generate doc-template when target markdown already exists without crashing', async () => {
    const docPath = join(testDir, 'docs', 'button.md')
    writeFileSafe(docPath, '# existing doc, must not be overwritten')

    await expect(runGenerateDocTemplate('Button', 'docs')).resolves.toBeUndefined()

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('already exists'))
    expect(readFileSync(docPath, 'utf-8')).toBe('# existing doc, must not be overwritten')
  })
})

describe('CLI E2E Output', () => {
  const originalCwd = process.cwd()
  const testDir = join(tmpdir(), `tigercat-cli-e2e-test-${Date.now()}`)
  let logSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    ensureDir(testDir)
    process.chdir(testDir)
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
  })

  afterEach(() => {
    logSpy.mockRestore()
    process.chdir(originalCwd)
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('creates the expected Vue project files from create', async () => {
    await runCreate('e2e-vue', 'vue3')

    const projectDir = join(testDir, 'e2e-vue')
    const packageJson = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf-8'))

    expect(packageJson.name).toBe('e2e-vue')
    expect(packageJson.dependencies).toHaveProperty('@expcat/tigercat-vue')
    expect(readFileSync(join(projectDir, 'src/App.vue'), 'utf-8')).toContain(
      "from '@expcat/tigercat-vue'"
    )
    expect(readFileSync(join(projectDir, 'src/style.css'), 'utf-8')).toContain(
      '@plugin "@expcat/tigercat-core/tailwind";'
    )
    expect(readFileSync(join(projectDir, 'src/style.css'), 'utf-8')).not.toContain(
      'tailwind/modern'
    )
  })

  it('creates React demo files and import output from add', async () => {
    writeFileSafe(
      join(testDir, 'package.json'),
      JSON.stringify({ dependencies: { '@expcat/tigercat-react': '^1.0.0' } })
    )
    ensureDir(join(testDir, 'src/components'))

    await runAdd(['button', 'Input'])

    const buttonDemo = readFileSync(join(testDir, 'src/components/ButtonDemo.tsx'), 'utf-8')
    const inputDemo = readFileSync(join(testDir, 'src/components/InputDemo.tsx'), 'utf-8')
    const output = logSpy.mock.calls.map((call) => call.join(' ')).join('\n')

    expect(buttonDemo).toContain("import { Button } from '@expcat/tigercat-react/Button'")
    expect(inputDemo).toContain("import { Input } from '@expcat/tigercat-react/Input'")
    expect(output).toContain("import { Button } from '@expcat/tigercat-react/Button'")
    expect(output).toContain("import { Input } from '@expcat/tigercat-react/Input'")
  })

  it('fails unknown component names and lists known names', async () => {
    writeFileSafe(
      join(testDir, 'package.json'),
      JSON.stringify({ dependencies: { '@expcat/tigercat-react': '^1.0.0' } })
    )
    ensureDir(join(testDir, 'src/components'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(runAdd(['NotARealWidget'])).rejects.toThrow(/process\.exit/)

    const output = [...logSpy.mock.calls, ...errorSpy.mock.calls]
      .map((call) => call.join(' '))
      .join('\n')
    expect(output).toContain('NotARealWidget')
    expect(output).toContain('Button')
    errorSpy.mockRestore()
  })
})

describe('CLI Integration - Create Project', () => {
  const testDir = join(tmpdir(), `tigercat-create-test-${Date.now()}`)

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('should create a complete Vue 3 project structure', () => {
    const files = getVue3Template('test-vue')
    const projectDir = join(testDir, 'test-vue')
    ensureDir(projectDir)

    for (const [filePath, content] of Object.entries(files)) {
      writeFileSafe(resolve(projectDir, filePath), content)
    }

    // Verify all files were created
    expect(existsSync(join(projectDir, 'package.json'))).toBe(true)
    expect(existsSync(join(projectDir, 'vite.config.ts'))).toBe(true)
    expect(existsSync(join(projectDir, 'src/main.ts'))).toBe(true)
    expect(existsSync(join(projectDir, 'src/App.vue'))).toBe(true)
    expect(existsSync(join(projectDir, 'src/style.css'))).toBe(true)

    // Verify package.json is valid JSON
    const pkg = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf-8'))
    expect(pkg.name).toBe('test-vue')
    expect(pkg.dependencies['@expcat/tigercat-vue']).toBeDefined()
  })

  it('should create a complete React project structure', () => {
    const files = getReactTemplate('test-react')
    const projectDir = join(testDir, 'test-react')
    ensureDir(projectDir)

    for (const [filePath, content] of Object.entries(files)) {
      writeFileSafe(resolve(projectDir, filePath), content)
    }

    // Verify all files were created
    expect(existsSync(join(projectDir, 'package.json'))).toBe(true)
    expect(existsSync(join(projectDir, 'vite.config.ts'))).toBe(true)
    expect(existsSync(join(projectDir, 'src/main.tsx'))).toBe(true)
    expect(existsSync(join(projectDir, 'src/App.tsx'))).toBe(true)
    expect(existsSync(join(projectDir, 'src/style.css'))).toBe(true)
    expect(existsSync(join(projectDir, 'tsconfig.node.json'))).toBe(true)

    // Verify package.json is valid JSON
    const pkg = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf-8'))
    expect(pkg.name).toBe('test-react')
    expect(pkg.dependencies['@expcat/tigercat-react']).toBeDefined()
    expect(pkg.dependencies.react).toBeDefined()
  })
})

describe('CLI Cross-Platform Paths', () => {
  const testDir = join(tmpdir(), `tigercat-path-test-${Date.now()}`)

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('template file keys use forward slashes only (portable)', () => {
    const vue3 = Object.keys(getVue3Template('app'))
    const react = Object.keys(getReactTemplate('app'))

    for (const key of [...vue3, ...react]) {
      expect(key).not.toContain('\\')
    }
  })

  it('writeFileSafe resolves forward-slash paths on current platform', () => {
    const projectDir = join(testDir, 'fwd-slash')
    ensureDir(projectDir)

    writeFileSafe(resolve(projectDir, 'src/components/App.tsx'), 'export default {}')
    expect(existsSync(join(projectDir, 'src', 'components', 'App.tsx'))).toBe(true)
    expect(readFileSync(join(projectDir, 'src', 'components', 'App.tsx'), 'utf-8')).toBe(
      'export default {}'
    )
  })

  it('handles project names with spaces', () => {
    const projectDir = join(testDir, 'my project')
    const files = getVue3Template('my project')
    ensureDir(projectDir)

    for (const [filePath, content] of Object.entries(files)) {
      writeFileSafe(resolve(projectDir, filePath), content)
    }

    expect(existsSync(join(projectDir, 'package.json'))).toBe(true)
    expect(existsSync(join(projectDir, 'src', 'main.ts'))).toBe(true)

    const pkg = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf-8'))
    expect(pkg.name).toBe('my project')
  })

  it('doctor works with paths containing spaces', () => {
    const projectDir = join(testDir, 'my project')
    ensureDir(projectDir)
    writeFileSafe(
      join(projectDir, 'package.json'),
      JSON.stringify({
        packageManager: 'pnpm@11.9.0',
        dependencies: { '@expcat/tigercat-vue': '^1.0.0', vue: '^3.5.38' },
        devDependencies: {
          '@expcat/tigercat-core': '^1.0.0',
          '@tailwindcss/vite': '^4.3.1',
          tailwindcss: '^4.3.1',
          typescript: '^6.0.3',
          vite: '^8.1.0'
        }
      })
    )

    const checks = collectDoctorChecks({ cwd: projectDir, nodeVersion: '22.23.1', env: {} })

    expect(checks.find((c) => c.name === 'Project package')?.status).toBe('pass')
    expect(checks.find((c) => c.name === 'Node.js')?.status).toBe('pass')
  })

  it('writeFileSafe creates deeply nested directories from template paths', () => {
    const projectDir = join(testDir, 'deep')
    ensureDir(projectDir)

    writeFileSafe(resolve(projectDir, 'src/a/b/c/d.ts'), 'deep')
    expect(readFileSync(join(projectDir, 'src', 'a', 'b', 'c', 'd.ts'), 'utf-8')).toBe('deep')
  })

  it('bin entry uses forward-slash relative path', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), 'packages/cli/package.json'), 'utf-8')
    )
    expect(packageJson.bin.tigercat).toBe('./dist/index.js')
    expect(packageJson.bin.tigercat).not.toContain('\\')
  })
})

describe('CLI runArgv', () => {
  let exitSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit:${code}`)
    }) as never)
  })

  afterEach(() => {
    exitSpy.mockRestore()
  })

  it('runs a successful argv command without throwing', () => {
    expect(() => runArgv('node', ['-e', ''])).not.toThrow()
  })

  it('rethrows by default when the command exits non-zero', () => {
    expect(() => runArgv('node', ['-e', 'process.exit(1)'])).toThrow()
  })

  it('logs the failure message and exits when failureMessage is set', () => {
    expect(() => runArgv('node', ['-e', 'process.exit(1)'], { failureMessage: 'boom' })).toThrow(
      'process.exit:1'
    )
    expect(exitSpy).toHaveBeenCalledWith(1)
  })
})

describe('CLI Migrate - rewriteSource', () => {
  it('rewrites named bindings and component subpaths while preserving local bindings', () => {
    const source = `import { Kanban } from '@expcat/tigercat-react/Kanban'
import { Kanban as Board } from '@expcat/tigercat-react'
import KanbanDefault from '@expcat/tigercat-react/Kanban'
export { Kanban as PublicBoard } from '@expcat/tigercat-react'
`
    const next = rewriteSource(source)

    expect(next).toContain(`import { TaskBoard as Kanban } from '@expcat/tigercat-react/TaskBoard'`)
    expect(next).toContain(`import { TaskBoard as Board } from '@expcat/tigercat-react'`)
    expect(next).toContain(`import KanbanDefault from '@expcat/tigercat-react/TaskBoard'`)
    expect(next).toContain(`export { TaskBoard as PublicBoard } from '@expcat/tigercat-react'`)

    const tsx = `import { Kanban } from '@expcat/tigercat-react/Kanban'\n`
    expect(rewriteSource(tsx, false, true)).toContain(
      `import { TaskBoard as Kanban } from '@expcat/tigercat-react/TaskBoard'`
    )
  })

  it('rewrites type-only props per package', () => {
    expect(rewriteSource(`import type { KanbanProps } from '@expcat/tigercat-vue'`)).toContain(
      'VueTaskBoardProps as KanbanProps'
    )
    expect(rewriteSource(`import type { StepperProps } from '@expcat/tigercat-react'`)).toContain(
      'InputNumberProps as StepperProps'
    )
  })

  it('keeps aliases, comments and multiline clauses intact', () => {
    const source = `import {
  // board
  Kanban,
  /* old */ Stepper as NumberStepper
} from '@expcat/tigercat-react'
`
    const next = rewriteSource(source)

    expect(next).toContain('// board')
    expect(next).toContain('TaskBoard as Kanban')
    expect(next).toContain('/* old */ InputNumber as NumberStepper')
  })

  it('rewrites a commented named binding together with its component subpath', () => {
    const source = `import { /* board */ Kanban } from '@expcat/tigercat-react/Kanban'`

    expect(rewriteSource(source)).toBe(
      `import { /* board */ TaskBoard as Kanban } from '@expcat/tigercat-react/TaskBoard'`
    )
  })

  it('never touches strings, comments, regex literals, template literal or JSX text content', () => {
    const source = `const text = "import { Kanban } from '@expcat/tigercat-react'"
// import { Kanban } from '@expcat/tigercat-react'
/* import { Kanban } from '@expcat/tigercat-react' */
export const tpl = \`from '@expcat/tigercat-react/Kanban'\`
`
    expect(rewriteSource(source)).toBe(source)

    const regexSource = String.raw`const quotePattern = /["']/
export const quoteText = "import '@expcat/tigercat-react/Kanban'"
const escapedPattern = /[\\/"']/u
if (true) /["']/.test('x')
{ const ready = true }
/["']/.test('x')
const fraction = 4 / 2
const quotient = call() / 2 / 3
const property = obj.return / 2
const patternQuotient = /["']/ / 2
export const otherText = "import '@expcat/tigercat-react/Kanban'"
`
    const real = `import { Kanban } from '@expcat/tigercat-react/Kanban'\n`
    const migrated = `import { TaskBoard as Kanban } from '@expcat/tigercat-react/TaskBoard'\n`
    expect(rewriteSource(source + regexSource + real)).toBe(source + regexSource + migrated)

    const jsxText = `export const Guide = () => <code>import '@expcat/tigercat-react/Kanban'</code>\n`
    const jsxExprText = `export const Guide = () => <code>{1}import '@expcat/tigercat-react/Kanban'</code>\n`
    const jsxNested = `const el = <div>{ok ? <b>import '@expcat/tigercat-react/Kanban'</b> : null}</div>\n`
    const jsxAttr = `const el = <a title="import '@expcat/tigercat-react/Kanban'">x</a>\n`
    const jsxRegex = `const el = <code>{/["']/.test('x')}import '@expcat/tigercat-react/Kanban'</code>\n`
    const jsxComment = `export function Guide(){ return /* render */ <code>import '@expcat/tigercat-react/Kanban'</code> }\n`
    for (const jsx of [jsxText, jsxExprText, jsxNested, jsxAttr, jsxRegex, jsxComment]) {
      expect(rewriteSource(jsx + real, false, true)).toBe(jsx + migrated)
    }
  })

  it('rewrites side-effect and dynamic import specifiers', () => {
    const source = `import '@expcat/tigercat-core/tailwind/modern'
const locales = import('@expcat/tigercat-core/datepicker-locales')
`
    const next = rewriteSource(source)

    expect(next).toContain(`import '@expcat/tigercat-core/tailwind'`)
    expect(next).toContain(`import('@expcat/tigercat-core/locales')`)

    const jsxExpr = `<div>{import('@expcat/tigercat-core/datepicker-locales')}</div>\n`
    expect(rewriteSource(jsxExpr, false, true)).toContain(`import('@expcat/tigercat-core/locales')`)

    const similarlyNamed = `import { locale } from '@expcat/tigercat-core/datepicker-locales-legacy/zh-CN'\n`
    expect(rewriteSource(similarlyNamed)).toBe(similarlyNamed)
  })

  it('only rewrites script blocks in Vue SFCs', () => {
    const source = `<template><Kanban /></template>
<script setup lang="ts">
import { Kanban } from '@expcat/tigercat-vue/Kanban'
</script>
`
    const next = rewriteSource(source, true)

    expect(next).toContain('<template><Kanban /></template>')
    expect(next).toContain(`import { TaskBoard as Kanban } from '@expcat/tigercat-vue/TaskBoard'`)
  })

  it('is idempotent', () => {
    const source = `import { Kanban, type KanbanProps } from '@expcat/tigercat-react'
import '@expcat/tigercat-core/tailwind/modern'
`
    const once = rewriteSource(source)

    expect(rewriteSource(once)).toBe(once)
  })
})

describe('CLI Add - portable examples', () => {
  const originalCwd = process.cwd()
  const testDir = join(tmpdir(), `tigercat-add-portable-${Date.now()}`)
  let logSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    ensureDir(testDir)
    process.chdir(testDir)
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
  })

  afterEach(() => {
    logSpy.mockRestore()
    process.chdir(originalCwd)
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('skips the demo file when no portable example exists and explains why', async () => {
    writeFileSafe(
      join(testDir, 'package.json'),
      JSON.stringify({ dependencies: { '@expcat/tigercat-react': '^1.0.0' } })
    )
    ensureDir(join(testDir, 'src/components'))

    await runAdd(['ConfigProvider'])

    expect(existsSync(join(testDir, 'src/components/ConfigProviderDemo.tsx'))).toBe(false)
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('no standalone ConfigProvider example')
    )
  })
})

describe('CLI Doctor - catalogs and skill catalog', () => {
  const testDir = join(tmpdir(), `tigercat-doctor-catalog-${Date.now()}`)

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  function writeCatalogProject(name: string, pkg: Record<string, unknown>) {
    const projectDir = join(testDir, name)
    ensureDir(projectDir)
    writeFileSafe(join(projectDir, 'package.json'), JSON.stringify(pkg, null, 2))
    return projectDir
  }

  function matrixOf(projectDir: string) {
    return collectDoctorChecks({ cwd: projectDir, nodeVersion: '22.23.1', env: {} }).find(
      (check) => check.name === 'Version compatibility matrix'
    )
  }

  it('fails when the default catalog resolves below the supported major', () => {
    const projectDir = writeCatalogProject('catalog-default-old', {
      dependencies: {
        '@expcat/tigercat-react': '^1.0.0',
        react: 'catalog:',
        'react-dom': 'catalog:'
      }
    })
    writeFileSafe(
      join(projectDir, 'pnpm-workspace.yaml'),
      'catalog:\n  react: ^18.2.0\n  react-dom: ^18.2.0\n'
    )

    const matrix = matrixOf(projectDir)

    expect(matrix?.status).toBe('fail')
    expect(
      matrix?.details?.some(
        (detail) => detail.includes('react@catalog:') && detail.includes('^18.2.0')
      )
    ).toBe(true)
  })

  it('fails when a named catalog resolves below the supported major', () => {
    const projectDir = writeCatalogProject('catalog-named-old', {
      dependencies: {
        '@expcat/tigercat-react': '^1.0.0',
        react: 'catalog:legacy',
        'react-dom': 'catalog:legacy'
      }
    })
    writeFileSafe(
      join(projectDir, 'pnpm-workspace.yaml'),
      'catalogs:\n  legacy:\n    react: ^18.2.0\n    react-dom: ^18.2.0\n'
    )

    const matrix = matrixOf(projectDir)

    expect(matrix?.status).toBe('fail')
    expect(matrix?.details?.some((detail) => detail.includes('catalog:legacy'))).toBe(true)
  })

  it('passes when a named catalog resolves to the supported major', () => {
    const projectDir = writeCatalogProject('catalog-named-current', {
      dependencies: {
        '@expcat/tigercat-react': '^1.0.0',
        react: 'catalog:current',
        'react-dom': 'catalog:current'
      }
    })
    writeFileSafe(
      join(projectDir, 'pnpm-workspace.yaml'),
      'catalogs:\n  current:\n    react: ^19.2.7\n    react-dom: ^19.2.7\n'
    )

    expect(matrixOf(projectDir)?.status).toBe('pass')
  })

  it('fails the skill catalog check when a hoisted install ships an older snapshot', () => {
    const appDir = writeCatalogProject('hoisted-consumer/app', {
      dependencies: { '@expcat/tigercat-mcp': '^2.0.0' }
    })
    const mcpDir = join(testDir, 'hoisted-consumer', 'node_modules', '@expcat', 'tigercat-mcp')
    ensureDir(join(mcpDir, 'dist'))
    ensureDir(join(mcpDir, 'snapshot'))
    writeFileSafe(
      join(mcpDir, 'package.json'),
      JSON.stringify({ name: '@expcat/tigercat-mcp', version: '2.0.0', main: './dist/index.js' })
    )
    writeFileSafe(join(mcpDir, 'dist', 'index.js'), 'export {}\n')
    writeFileSafe(join(mcpDir, 'snapshot', 'version.json'), JSON.stringify({ version: '2.0.0' }))

    const catalog = collectDoctorChecks({ cwd: appDir, nodeVersion: '22.23.1', env: {} }).find(
      (check) => check.name === 'Skill catalog'
    )

    expect(catalog?.status).toBe('fail')
    expect(catalog?.message).toContain('2.0.0')
  })
})
