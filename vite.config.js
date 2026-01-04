import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { join } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-nojekyll',
      closeBundle() {
        try {
          copyFileSync(
            join(process.cwd(), '.nojekyll'),
            join(process.cwd(), 'dist', '.nojekyll')
          )
        } catch (e) {
          // .nojekyll might not exist, that's okay
        }
      }
    }
  ],
  base: '/SadaqahJariyahRadio/',
})
