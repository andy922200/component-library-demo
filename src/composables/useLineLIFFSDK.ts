import liff from '@line/liff'
import { ref } from 'vue'

const isInitialized = ref(false)

export const useLineLIFFSDK = () => {
  const initLine = async (liffId: string) => {
    if (!liffId) return undefined

    if (isInitialized.value) return liff

    try {
      await liff.init({ liffId })
      isInitialized.value = true
    } catch (err) {
      console.error('Failed to initialize LIFF:', err)
      isInitialized.value = false
    }

    return liff
  }

  const restoreUrlParamsFromSessionStorage = () => {
    const storedParams = JSON.parse(sessionStorage.getItem('line-sdk-saved-params') ?? '{}')
    if (storedParams && Object.keys(storedParams).length > 0) {
      const currentParams = new URLSearchParams(window.location.search)
      const newParams = new URLSearchParams(storedParams)

      // 合併現有參數和儲存的參數，避免覆蓋現有參數
      newParams.forEach((value, key) => {
        if (!currentParams.has(key)) {
          currentParams.set(key, value)
        }
      })

      const newUrl = `${window.location.origin}${window.location.pathname}?${currentParams.toString()}`
      window.history.replaceState({}, document.title, newUrl)
    }
  }

  const clearSavedParams = () => {
    sessionStorage.removeItem('line-sdk-saved-params')
  }

  const getLiffInfo = () => {
    if (!isInitialized.value) return null
    return {
      isInClient: liff.isInClient(),
      isLoggedIn: liff.isLoggedIn(),
      os: liff.getOS(),
      language: liff.getLanguage(),
    }
  }

  const login = async (savedParams?: Record<string, string>, redirectUri?: string) => {
    if (!isInitialized.value) return

    if (liff.isLoggedIn()) {
      return true
    }

    if (savedParams) {
      sessionStorage.setItem('line-sdk-saved-params', JSON.stringify(savedParams ?? {}))
    }

    liff.login({
      redirectUri,
    }) // 重定向到 LINE
    return false
  }

  const logout = () => {
    if (!isInitialized.value) return
    liff.logout()
  }

  const getUserInfo = async () => {
    const isLoggedIn = liff.isLoggedIn()
    if (!isInitialized.value || !isLoggedIn) return null

    try {
      if (liff.isLoggedIn()) {
        const [profile, idToken] = await Promise.all([liff.getProfile(), liff.getIDToken()])

        return {
          userId: profile.userId,
          idToken,
        }
      }

      return null
    } catch (err) {
      console.error('Error getting user info:', err)
      return null
    }
  }

  return {
    liff,
    isInitialized,
    initLine,
    getLiffInfo,
    loginLine: login,
    logoutLine: logout,
    getUserInfo,
    restoreUrlParamsFromSessionStorage,
    clearSavedParams,
  }
}
