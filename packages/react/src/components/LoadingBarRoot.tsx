import { isBrowser, type LoadingBarApi, type LoadingBarOptions } from '@expcat/tigercat-core'

export type { LoadingBarOptions }

type LoadingBarCommand =
  | { type: 'start'; options?: LoadingBarOptions }
  | { type: 'set'; percentage: number }
  | { type: 'inc'; delta?: number }
  | { type: 'finish' }
  | { type: 'error' }
  | { type: 'clear' }

let loadingBarModulePromise: Promise<typeof import('./LoadingBar')> | null = null
let pendingCommands: LoadingBarCommand[] = []
let resolvedApi: LoadingBarApi | null = null

function loadLoadingBarModule(): Promise<typeof import('./LoadingBar')> {
  loadingBarModulePromise ??= import('./LoadingBar')
  return loadingBarModulePromise
}

function applyCommand(api: LoadingBarApi, command: LoadingBarCommand): void {
  if (command.type === 'start') {
    api.start(command.options)
    return
  }
  if (command.type === 'set') {
    api.set(command.percentage)
    return
  }
  if (command.type === 'inc') {
    api.inc(command.delta)
    return
  }
  api[command.type]()
}

function enqueue(command: LoadingBarCommand): void {
  if (!isBrowser()) return
  if (resolvedApi) {
    applyCommand(resolvedApi, command)
    return
  }

  pendingCommands.push(command)
  void loadLoadingBarModule().then(({ LoadingBar }) => {
    resolvedApi = LoadingBar
    const queue = pendingCommands
    pendingCommands = []
    for (const item of queue) {
      applyCommand(LoadingBar, item)
    }
  })
}

export const LoadingBar: LoadingBarApi = {
  start(options) {
    enqueue({ type: 'start', options })
  },
  set(percentage) {
    enqueue({ type: 'set', percentage })
  },
  inc(delta) {
    enqueue({ type: 'inc', delta })
  },
  finish() {
    enqueue({ type: 'finish' })
  },
  error() {
    enqueue({ type: 'error' })
  },
  clear() {
    enqueue({ type: 'clear' })
  }
}
