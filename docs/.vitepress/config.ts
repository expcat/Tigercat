import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Tigercat',
  description: 'Tailwind CSS component library for Vue 3 and React',
  base: '/Tigercat/',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    logo: '/logo.svg',
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api' },
      { text: 'Playground', link: '/playground' },
      { text: 'Theme', link: '/theme-preview' },
      { text: 'Reference', link: '/reference/' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Performance', link: '/guide/performance' },
          { text: 'CLI', link: '/guide/cli' },
          { text: 'Release', link: '/guide/release' }
        ]
      },
      {
        text: 'API',
        items: [
          { text: 'Summary', link: '/api' },
          { text: 'Basic', link: '/reference/shared/props/basic' },
          { text: 'Form', link: '/reference/shared/props/form' },
          { text: 'Feedback', link: '/reference/shared/props/feedback' },
          { text: 'Layout', link: '/reference/shared/props/layout' },
          { text: 'Navigation', link: '/reference/shared/props/navigation' },
          { text: 'Data', link: '/reference/shared/props/data' },
          { text: 'Charts', link: '/reference/shared/props/charts' },
          { text: 'Composite', link: '/reference/shared/props/composite' },
          { text: 'Advanced', link: '/reference/shared/props/advanced' }
        ]
      },
      {
        text: 'Examples',
        items: [
          { text: 'Vue', link: '/reference/vue/' },
          { text: 'React', link: '/reference/react/' },
          { text: 'Framework Playground', link: '/playground' },
          { text: 'Theme Preview', link: '/theme-preview' }
        ]
      }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/expcats/Tigercat' }]
  },
  markdown: {
    codeTransformers: []
  }
})
