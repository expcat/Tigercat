export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2026-05-24',
  css: ['~/assets/main.css'],
  build: {
    transpile: ['@expcat/tigercat-core', '@expcat/tigercat-vue']
  },
  typescript: {
    strict: true,
    typeCheck: false
  }
})
