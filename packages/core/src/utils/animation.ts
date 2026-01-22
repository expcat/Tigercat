// Shake animation keyframes and class
const SHAKE_ANIMATION_CSS = `
@keyframes tiger-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}

.tiger-animate-shake {
  animation: tiger-shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
`

let isStyleInjected = false

export function injectShakeStyle() {
  if (typeof document === 'undefined' || isStyleInjected) return

  const styleId = 'tiger-ui-animation-styles'
  if (document.getElementById(styleId)) {
    isStyleInjected = true
    return
  }

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = SHAKE_ANIMATION_CSS
  document.head.appendChild(style)
  isStyleInjected = true
}

export const SHAKE_CLASS = 'tiger-animate-shake'
