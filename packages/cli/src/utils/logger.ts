import pc from 'picocolors'

export function logSuccess(msg: string) {
  console.log(pc.green('✔') + ' ' + msg)
}

export function logInfo(msg: string) {
  console.log(pc.blue('ℹ') + ' ' + msg)
}

export function logWarn(msg: string) {
  console.log(pc.yellow('⚠') + ' ' + msg)
}

export function logError(msg: string) {
  console.error(pc.red('✖') + ' ' + msg)
}

export function logStep(step: number, total: number, msg: string) {
  console.log(pc.dim(`[${step}/${total}]`) + ' ' + msg)
}
