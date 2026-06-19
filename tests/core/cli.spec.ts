import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { existsSync, mkdirSync, rmSync, readFileSync, readdirSync } from 'node:fs'
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
import { runCreate } from '@expcat/tigercat-cli/commands/create'
import { runAdd } from '@expcat/tigercat-cli/commands/add'
import { runPlayground } from '@expcat/tigercat-cli/commands/playground'
import {
  runGenerateDocs,
  runGenerateTest,
  runGenerateDocTemplate
} from '@expcat/tigercat-cli/commands/generate'
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

  it('should flatten all components correctly', () => {
    expect(ALL_COMPONENTS.length).toBeGreaterThan(50)
    expect(ALL_COMPONENTS).toContain('Button')
    expect(ALL_COMPONENTS).toContain('Input')
    expect(ALL_COMPONENTS).toContain('Table')
    expect(ALL_COMPONENTS).toContain('BarChart')
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
})

describe('CLI Templates - Vue 3', () => {
  it('should generate all required files', () => {
    const files = getVue3Template('test-app')
    const fileNames = Object.keys(files)

    expect(fileNames).toContain('package.json')
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
    expect(pkg.name).toBe('my-project')
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
    expect(files['src/style.css']).toContain('@expcat/tigercat-core/tailwind/modern')
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
    // Plugin emits the .dark variable block; template enables OS-level
    // light/dark color-scheme so native form controls follow suit.
    expect(files['src/style.css']).toContain('color-scheme: light dark')
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
    expect(files['src/style.css']).toContain('@expcat/tigercat-core/tailwind/modern')
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
      packageManager: 'pnpm@10.26.2',
      dependencies: {
        '@expcat/tigercat-react': '^1.0.0',
        react: '^19.2.5',
        'react-dom': '^19.2.5'
      },
      devDependencies: {
        '@expcat/tigercat-core': '^1.0.0',
        '@tailwindcss/vite': '^4.2.4',
        '@vitejs/plugin-react': '^6.0.1',
        tailwindcss: '^4.2.4',
        typescript: '^6.0.3',
        vite: '^8.0.10'
      }
    })

    const checks = collectDoctorChecks({ cwd: projectDir, nodeVersion: '20.0.0', env: {} })

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
        '@tailwindcss/vite': '^4.2.4',
        '@vitejs/plugin-vue': '^6.0.3',
        tailwindcss: '^4.2.4',
        typescript: '^6.0.3',
        vite: '^8.0.10',
        'vue-tsc': '^3.2.7'
      }
    })

    const checks = collectDoctorChecks({ cwd: projectDir, nodeVersion: '16.20.2', env: {} })
    const failedNames = checks.filter((check) => check.status === 'fail').map((check) => check.name)

    expect(failedNames).toEqual(expect.arrayContaining(['Node.js', 'pnpm']))
    expect(failedNames).not.toContain('Tailwind CSS')
  })

  it('fails when the Tailwind v4 Vite plugin is missing', () => {
    const projectDir = writePackage('missing-tailwind-vite-plugin', {
      packageManager: 'pnpm@10.26.2',
      dependencies: {
        '@expcat/tigercat-vue': '^1.0.0',
        vue: '^3.5.26'
      },
      devDependencies: {
        '@expcat/tigercat-core': '^1.0.0',
        '@vitejs/plugin-vue': '^6.0.3',
        tailwindcss: '^4.2.4',
        typescript: '^6.0.3',
        vite: '^8.0.10',
        'vue-tsc': '^3.2.7'
      }
    })

    const checks = collectDoctorChecks({ cwd: projectDir, nodeVersion: '20.0.0', env: {} })
    const tailwindCheck = checks.find((check) => check.name === 'Tailwind CSS')

    expect(tailwindCheck?.status).toBe('fail')
    expect(tailwindCheck?.message).toContain('@tailwindcss/vite is required')
  })

  it('warns when a supported framework is not detected', () => {
    const projectDir = writePackage('plain-vite', {
      packageManager: 'pnpm@10.26.2',
      devDependencies: {
        '@tailwindcss/vite': '^4.1.18',
        tailwindcss: '^4.1.18',
        typescript: '^5.9.3',
        vite: '^7.3.0'
      }
    })

    const checks = collectDoctorChecks({ cwd: projectDir, nodeVersion: '20.0.0', env: {} })

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
        '@vitejs/plugin-vue': '^6.0.3',
        tailwindcss: '^4.1.18',
        typescript: '^5.9.3',
        vite: '^7.3.0',
        'vue-tsc': '^2.2.0'
      }
    })

    const checks = collectDoctorChecks({
      cwd: projectDir,
      nodeVersion: '20.0.0',
      env: { npm_config_user_agent: 'pnpm/10.26.2 npm/? node/v20.0.0 darwin arm64' }
    })

    expect(checks.find((check) => check.name === 'pnpm')?.status).toBe('pass')
  })

  it('fails when package.json is invalid', () => {
    const projectDir = join(testDir, 'invalid-package')
    ensureDir(projectDir)
    writeFileSafe(join(projectDir, 'package.json'), '{ nope')

    const checks = collectDoctorChecks({ cwd: projectDir, nodeVersion: '20.0.0', env: {} })

    expect(checks.find((check) => check.name === 'Project package')?.status).toBe('fail')
    expect(checks.some((check) => check.name === 'Tailwind CSS')).toBe(false)
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

  it('previews docs generation without writing markdown files', async () => {
    writeFileSafe(
      join(testDir, 'types/button.ts'),
      `export interface ButtonProps {
  label?: string
}
`
    )

    await runGenerateDocs('types', 'api', true)

    expect(existsSync(join(testDir, 'api'))).toBe(false)
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Dry run'))
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
      '@expcat/tigercat-core/tailwind/modern'
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

    expect(buttonDemo).toContain("import { Button } from '@expcat/tigercat-react'")
    expect(inputDemo).toContain('<Input />')
    expect(output).toContain("import { Button, Input } from '@expcat/tigercat-react'")
  })

  it('generates component markdown and index output from generate docs', async () => {
    writeFileSafe(
      join(testDir, 'types/button.ts'),
      `export interface ButtonProps {
  /** Button label */
  label?: string
  variant: 'primary' | 'secondary'
}
`
    )

    await runGenerateDocs('types', 'api')

    const buttonDoc = readFileSync(join(testDir, 'api/button.md'), 'utf-8')
    const indexDoc = readFileSync(join(testDir, 'api/index.md'), 'utf-8')

    expect(buttonDoc).toContain('# Button')
    expect(buttonDoc).toContain('Source: `button.ts`')
    expect(buttonDoc).toContain('`variant`')
    expect(buttonDoc).toContain("`'primary' \\| 'secondary'`")
    expect(indexDoc).toContain('- [Button](./button.md)')
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
        packageManager: 'pnpm@10.26.2',
        dependencies: { '@expcat/tigercat-vue': '^1.0.0', vue: '^3.5.33' },
        devDependencies: {
          '@expcat/tigercat-core': '^1.0.0',
          '@tailwindcss/vite': '^4.2.4',
          tailwindcss: '^4.2.4',
          typescript: '^6.0.3',
          vite: '^8.0.10'
        }
      })
    )

    const checks = collectDoctorChecks({ cwd: projectDir, nodeVersion: '22.0.0', env: {} })

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
