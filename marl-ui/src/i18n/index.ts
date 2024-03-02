import { createI18n, I18n } from 'vue-i18n'
import type { App } from 'vue'
import enLanguages from './en'
import zhLanguages from './zh'

export let i18n: ReturnType<typeof createI18n>
export function setupI18n(app: App) {
  const messages = {
    en: enLanguages,
    zh: zhLanguages,
  }
  i18n = createI18n({
    legacy: true, // 修复组件引入i18n时vite脚手架报错的问题
    locale: 'en',
    messages,
  }) as I18n

  app.use(i18n)
}
