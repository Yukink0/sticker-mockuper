import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// https://vite.dev/config/
// 言語ごとにOGPメタタグを出し分けるため、/ (日本語)・/en/・/ko/ を別HTMLとしてビルドする
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        en: resolve(__dirname, 'en/index.html'),
        ko: resolve(__dirname, 'ko/index.html'),
      },
    },
  },
})
