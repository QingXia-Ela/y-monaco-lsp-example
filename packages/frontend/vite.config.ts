import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin'

const fullReloadAlways: Plugin = {
  name: 'full-reload',
  handleHotUpdate({ server }) {
    server.ws.send({ type: "full-reload" });
    return [];
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), fullReloadAlways],
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: "inline",
      plugins: [importMetaUrlPlugin,]
    },
  },
})
