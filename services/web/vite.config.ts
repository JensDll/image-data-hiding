import url from 'url'

import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'

const srcPath = url.fileURLToPath(new url.URL('./src', import.meta.url))
const tailwindThemePath = url.fileURLToPath(
  new url.URL('./tailwind/theme', import.meta.url)
)

export default defineConfig({
  resolve: {
    alias: {
      '~': srcPath,
      'tailwind-theme': tailwindThemePath
    }
  },
  plugins: [
    Vue(),
    Components({
      dts: './dts/components.d.ts'
    })
  ]
})
