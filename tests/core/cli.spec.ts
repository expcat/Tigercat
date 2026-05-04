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
  CLI_VERSION
} from '@expcat/tigercat-cli/constants'

// Test utils
import { ensureDir, writeFileSafe, isDirEmpty, readFileSafe } from '@expcat/tigercat-cli/utils/fs'
import { collectDoctorChecks } from '@expcat/tigercat-cli/commands/doctor'

describe('CLI Constants', () => {
  it('should export correct CLI name and version', () => {
    expect(CLI_NAME).toBe('tigercat')
    expect(CLI_VERSION).toBe('0.9.0')
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
        react: '^19.2.3',
        'react-dom': '^19.2.3'
      },
      devDependencies: {
        '@expcat/tigercat-core': '^1.0.0',
        '@tailwindcss/vite': '^4.1.18',
        '@vitejs/plugin-react': '^4.3.4',
        tailwindcss: '^4.1.18',
        typescript: '^5.9.3',
        vite: '^7.3.0'
      }
    })

    const checks = collectDoctorChecks({ cwd: projectDir, nodeVersion: '20.0.0', env: {} })

    expect(checks.every((check) => check.status === 'pass')).toBe(true)
  })

  it('fails when Node, pnpm, and Tailwind are too old', () => {
    const projectDir = writePackage('old-toolchain', {
      packageManager: 'pnpm@7.33.0',
      dependencies: {
        '@expcat/tigercat-vue': '^1.0.0',
        vue: '^3.5.26'
      },
      devDependencies: {
        '@expcat/tigercat-core': '^1.0.0',
        '@tailwindcss/vite': '^3.4.0',
        '@vitejs/plugin-vue': '^6.0.3',
        tailwindcss: '^3.4.17',
        typescript: '^5.9.3',
        vite: '^7.3.0',
        'vue-tsc': '^2.2.0'
      }
    })

    const checks = collectDoctorChecks({ cwd: projectDir, nodeVersion: '16.20.2', env: {} })
    const failedNames = checks.filter((check) => check.status === 'fail').map((check) => check.name)

    expect(failedNames).toEqual(expect.arrayContaining(['Node.js', 'pnpm', 'Tailwind CSS']))
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
