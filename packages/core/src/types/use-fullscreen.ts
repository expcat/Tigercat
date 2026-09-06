export interface UseFullscreenOptions {
  target?: Element | (() => Element | null | undefined) | null
  onChange?: (isFullscreen: boolean) => void
  onError?: (error: Error) => void
}
