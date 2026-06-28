import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const framework = process.argv[2]

const frameworkConfig = {
  react: {
    packageDir: 'packages/react',
    sourceFile: 'src/index.tsx'
  },
  vue: {
    packageDir: 'packages/vue',
    sourceFile: 'src/index.ts'
  }
}

const config = frameworkConfig[framework]

if (!config) {
  throw new Error('Usage: node scripts/rewrite-framework-root-index.mjs <react|vue>')
}

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const packageDir = join(repoRoot, config.packageDir)
const sourcePath = join(packageDir, config.sourceFile)
const distPath = join(packageDir, 'dist', 'index.mjs')
const coreDistPath = join(repoRoot, 'packages/core/dist/index.js')

const source = readFileSync(sourcePath, 'utf8')
const lines = source.split(/\r?\n/)
const output = []
const localRuntimeExportNames = collectLocalRuntimeExportNames(lines)
const coreRuntimeExportNames = await collectCoreRuntimeExportNames()

let isTypeExportBlock = false
let wroteMessageRoot = false
let wroteNotificationRoot = false

function toRuntimeSpecifier(specifier) {
  if (!specifier.startsWith('.')) {
    return specifier
  }

  return `${specifier}.mjs`
}

function assertRelativeTarget(specifier) {
  if (!specifier.startsWith('.')) {
    return
  }

  const targetPath = join(packageDir, 'dist', specifier.replace(/^\.\//, ''))

  if (!existsSync(targetPath)) {
    throw new Error(`Missing root export target for ${framework}: ${targetPath}`)
  }
}

function collectLocalRuntimeExportNames(sourceLines) {
  const names = new Set()
  let isCollectingTypeBlock = false

  for (let index = 0; index < sourceLines.length; index += 1) {
    const trimmed = sourceLines[index].trim()

    if (isCollectingTypeBlock) {
      if (trimmed.includes('} from ')) {
        isCollectingTypeBlock = false
      }

      continue
    }

    if (trimmed.startsWith('export type {')) {
      if (!trimmed.includes('} from ')) {
        isCollectingTypeBlock = true
      }

      continue
    }

    if (!trimmed.startsWith('export {')) {
      continue
    }

    let statement = trimmed

    while (!statement.includes(' from ') && index + 1 < sourceLines.length) {
      index += 1
      statement = `${statement} ${sourceLines[index].trim()}`
    }

    for (const name of parseNamedExports(statement)) {
      names.add(name)
    }
  }

  return names
}

function parseNamedExports(statement) {
  const match = statement.replace(/\s+/g, ' ').match(/^export \{(.+)\} from /)

  if (!match) {
    return []
  }

  return match[1]
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => {
      const aliasMatch = name.match(/\s+as\s+([A-Za-z_$][\w$]*)$/)
      return aliasMatch ? aliasMatch[1] : name
    })
}

async function collectCoreRuntimeExportNames() {
  if (!existsSync(coreDistPath)) {
    throw new Error(
      `Missing core dist index for ${framework}: ${coreDistPath}. Run the workspace build so @expcat/tigercat-core is built first.`
    )
  }

  const namespace = await import(pathToFileURL(coreDistPath).href)

  return Object.keys(namespace)
    .filter((name) => !name.startsWith('type '))
    .filter((name) => {
      const aliasMatch = name.match(/\s+as\s+([A-Za-z_$][\w$]*)$/)
      const exportedName = aliasMatch ? aliasMatch[1] : name
      return !localRuntimeExportNames.has(exportedName)
    })
}

function createCoreRuntimeExport() {
  return `export {\n  ${coreRuntimeExportNames.join(',\n  ')}\n} from '@expcat/tigercat-core';`
}

function createMessageRootExport() {
  wroteMessageRoot = true

  return `function forwardMessage(method, options) {
  let closeMessage = null;
  let requestedClose = false;
  queueMicrotask(() => {
    void import('./components/Message.mjs').then(({ Message }) => {
      const close = Message[method](options);
      if (requestedClose) {
        close();
      } else {
        closeMessage = close;
      }
    });
  });
  return () => {
    if (closeMessage) {
      closeMessage();
      closeMessage = null;
    } else {
      requestedClose = true;
    }
  };
}
const Message = {
  success(options) {
    return forwardMessage('success', options);
  },
  warning(options) {
    return forwardMessage('warning', options);
  },
  error(options) {
    return forwardMessage('error', options);
  },
  info(options) {
    return forwardMessage('info', options);
  },
  loading(options) {
    return forwardMessage('loading', options);
  },
  clear() {
    queueMicrotask(() => {
      void import('./components/Message.mjs').then(({ Message }) => {
        Message.clear();
      });
    });
  }
};
export { Message };`
}

function createNotificationRootExport() {
  wroteNotificationRoot = true

  return `function forwardNotification(method, options) {
  let closeNotification = null;
  let requestedClose = false;
  queueMicrotask(() => {
    void import('./components/Notification.mjs').then(({ notification }) => {
      const close = notification[method](options);
      if (requestedClose) {
        close();
      } else {
        closeNotification = close;
      }
    });
  });
  return () => {
    if (closeNotification) {
      closeNotification();
      closeNotification = null;
    } else {
      requestedClose = true;
    }
  };
}
const notification = {
  success(options) {
    return forwardNotification('success', options);
  },
  warning(options) {
    return forwardNotification('warning', options);
  },
  error(options) {
    return forwardNotification('error', options);
  },
  info(options) {
    return forwardNotification('info', options);
  },
  clear(position) {
    queueMicrotask(() => {
      void import('./components/Notification.mjs').then(({ notification }) => {
        notification.clear(position);
      });
    });
  }
};
export { notification };`
}

for (let index = 0; index < lines.length; index += 1) {
  const trimmed = lines[index].trim()

  if (isTypeExportBlock) {
    if (trimmed.includes('} from ')) {
      isTypeExportBlock = false
    }

    continue
  }

  if (!trimmed || trimmed.startsWith('//')) {
    continue
  }

  if (trimmed.startsWith('export type {')) {
    if (!trimmed.includes('} from ')) {
      isTypeExportBlock = true
    }

    continue
  }

  if (trimmed.startsWith('export * from ')) {
    if (trimmed === "export * from '@expcat/tigercat-core'") {
      output.push(createCoreRuntimeExport())
    } else {
      output.push(trimmed.endsWith(';') ? trimmed : `${trimmed};`)
    }

    continue
  }

  if (!trimmed.startsWith('export {')) {
    continue
  }

  let statement = trimmed

  while (!statement.includes(' from ') && index + 1 < lines.length) {
    index += 1
    statement = `${statement} ${lines[index].trim()}`
  }

  statement = statement.replace(/\s+/g, ' ').replace(/;$/, '')

  const match = statement.match(/ from '([^']+)'$/)

  if (!match) {
    continue
  }

  const nextSpecifier = toRuntimeSpecifier(match[1])

  if (statement === "export { Message } from './components/MessageRoot'") {
    if (!wroteMessageRoot) {
      output.push(createMessageRootExport())
    }

    continue
  }

  if (statement === "export { notification } from './components/NotificationRoot'") {
    if (!wroteNotificationRoot) {
      output.push(createNotificationRootExport())
    }

    continue
  }

  assertRelativeTarget(nextSpecifier)

  output.push(`${statement.replace(match[1], nextSpecifier)};`)
}

writeFileSync(distPath, `${output.join('\n')}\n`)
