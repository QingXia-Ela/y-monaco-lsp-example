import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'vscode/localExtensionHost'

setTimeout(() => {
createApp(App).mount('#app')
});