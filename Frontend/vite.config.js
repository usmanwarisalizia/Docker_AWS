import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'monaco-editor': path.resolve(__dirname, 'node_modules/monaco-editor'),
    },
  },
  optimizeDeps: {
    exclude: ['y-monaco'],
  },
})
