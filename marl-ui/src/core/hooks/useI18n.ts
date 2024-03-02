import { ref, watch } from 'vue'
import { useI18n as I18n } from 'vue-i18n'

export const useI18n = () => {
  const { t, locale } = I18n()

  const langText = ref(t('login.lang'))

  function changeLang(lang: string) {
    locale.value = lang
  }

  watch(
    () => locale.value,
    () => {
      langText.value = t('login.lang')
    }
  )

  return {
    locale,
    t,
    changeLang,
    langText,
  }
}
