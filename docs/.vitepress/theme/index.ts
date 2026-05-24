import DefaultTheme from 'vitepress/theme'
import FrameworkPlayground from './components/FrameworkPlayground.vue'
import ThemePreview from './components/ThemePreview.vue'
import './styles.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('FrameworkPlayground', FrameworkPlayground)
    app.component('ThemePreview', ThemePreview)
  }
}
