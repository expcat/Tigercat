/// <reference types="vite/client" />

declare module 'virtual:tigercat-playground-runtime' {
  import type { DemoRuntimeUrls } from '@demo-shared/playground/types'
  const urls: DemoRuntimeUrls
  export default urls
}
