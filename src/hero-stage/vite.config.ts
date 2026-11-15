import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// One script and one stylesheet for the static site: /js/ld-stage.js and /css/ld-stage.css.
// The page mounts the scene into every [data-ld-stage] element (see mount.tsx).
export default defineConfig({
  plugins: [react()],
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: { entry: 'mount.tsx', name: 'LeadishStage', formats: ['iife'], fileName: () => 'ld-stage.js' },
    rollupOptions: { output: { assetFileNames: 'ld-stage.[ext]' } },
  },
  resolve: { dedupe: ['react', 'react-dom'] },
})
