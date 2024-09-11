/// <reference types="vite/client" />

declare module 'monaco-editor-vanilla/esm/vs/basic-languages/mdx/mdx' {
  const conf: any, language: any
  export {
    language,
    conf
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}