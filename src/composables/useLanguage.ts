import { computed, getCurrentInstance, ref, watch } from 'vue'

import { messages } from '@/plugins/i18n/config'
import { Locales } from '@/plugins/i18n/config/locales'

/** 確保全域只有一個 language 狀態 */
const language = ref<string>('')

const getLanguage = (): string => {
  let language = ''
  if (typeof window !== 'undefined') {
    language = window.navigator.language.toLowerCase()
  }
  return language
}

export function useLanguage() {
  const appLangs = Object.keys(messages)
  const vueApp = getCurrentInstance()?.appContext.app

  const IS_ZHTW_OR_ZHCN = computed(() =>
    [Locales.zhTw, Locales.zhCn].includes(language.value as Locales),
  )

  async function getLanguageBasedOnBrowser() {
    let browserLang = language.value.toLowerCase() || getLanguage()
    if (!appLangs.includes(browserLang)) {
      browserLang = Locales.zhTw
    }
    setLanguage(browserLang)
    return true
  }

  function setLanguage(lang: string) {
    language.value = lang
    changeI18NLang(lang)
  }

  function changeI18NLang(lang: string) {
    if (!vueApp) return
    vueApp.config.globalProperties.$i18n.locale = lang
  }

  watch(language, (newLang) => {
    changeI18NLang(newLang)
  })

  return {
    language,
    getLanguageBasedOnBrowser,
    setLanguage,
    changeI18NLang,

    IS_ZHTW_OR_ZHCN,
  }
}
