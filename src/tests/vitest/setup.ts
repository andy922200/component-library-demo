import { config } from '@vue/test-utils'

// Mock i18n
config.global.mocks.$t = (phrase: string) => phrase

// Mock URL.createObjectURL and URL.revokeObjectURL
globalThis.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/fake-url')
globalThis.URL.revokeObjectURL = vi.fn()
