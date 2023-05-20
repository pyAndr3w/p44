import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const isProduction = process.argv.includes('production')

// https://vitejs.dev/config/
export default defineConfig({
  base: isProduction ? '/p44/' : '/',
  build: {
    outDir: "./dist"
  },
  plugins: [react()],
})
