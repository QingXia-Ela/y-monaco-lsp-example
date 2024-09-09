import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin'
import vsixPlugin from '@codingame/monaco-vscode-rollup-vsix-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: "inline",
      plugins: [importMetaUrlPlugin,]
    }
  }
})
