import VueI18nVitePlugin from '@intlify/unplugin-vue-i18n/vite'
import vue from '@vitejs/plugin-vue'
import { dirname, join, resolve } from 'path'
import Icons from 'unplugin-icons/vite'
import { fileURLToPath } from 'url'
import svgLoader from 'vite-svg-loader'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/component-library-demo/' : '',
  plugins: [
    vue(),
    VueI18nVitePlugin({
      runtimeOnly: false,
      include: [resolve(dirname(fileURLToPath(import.meta.url)), './plugins/lang/*.ts')],
    }),
    svgLoader(),
    Icons({
      autoInstall: true,
    }),
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: join(__dirname, './src'),
      },
    ],
  },
  server: {
    open: true,
  },
  build: {
    rollupOptions: {
      external: [resolve(__dirname, './src/**/*.**.test.ts')],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/vitest/setup.ts',
    include: ['./src/tests/vitest/**/*.(spec|test).ts'],
    coverage: {
      enabled: true,
      reporter: ['text', 'json', 'html'],
    },
  },
})
