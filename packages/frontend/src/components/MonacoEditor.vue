<template>
  <div class="wrapper">
    <div class="flex gap-1">
      <button type="button" @click="() => switchLsp()" :disabled="lspConnected === State.Starting">{{ lspText
        }}</button>
      <button type="button" @click="() => switchConnect()" id="y-connect-btn">{{ COOPconnected ? 'Disconnect-COOP' :
        'Connect-COOP'
        }}</button>
      <input type="text" id="y-name-input" placeholder="Your name">
      <button type="button" id="y-set-btn">Set Name</button>
    </div>
    <p></p>
    <p>This is a demo of the <a href="https://github.com/yjs/yjs">Yjs</a> + <a
        href="https://github.com/TypeFox/monaco-languageclient">Monaco Language Client</a> ⇔ <a
        href="https://microsoft.github.io/monaco-editor/">Monaco</a> binding: <a
        href="https://github.com/QingXia-Ela/y-monaco-lsp-example">y-monaco-lsp-example</a>.</p>
    <p>The content of this editor is shared with every client that visits this domain.</p>
    <p>Backend should running manually.</p>
    <div id="monaco" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { configureMonacoWorkers, runClient } from '../monaco/client-new'
import { ref } from 'vue';
import { WebsocketProvider } from 'y-websocket'
import updateConnectorStyle from '../monaco/utils/updateConnectorStyle'
import { onBeforeUnmount } from 'vue';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { State } from 'vscode-languageclient';
import { computed } from 'vue';

const COOPconnected = ref(false)
const lspConnected = ref<State>(State.Stopped)
let outerProvider: WebsocketProvider | null = null
let outerLanguageClient: MonacoLanguageClient | null = null

const lspText = computed(() => {
  switch (lspConnected.value) {
    case State.Starting:
      return 'LSP Starting...'
    case State.Stopped:
      return 'Start LSP Service'
    default:
      return 'Stop LSP Service'
  }
})

function switchConnect(connect = !COOPconnected.value) {
  if (outerProvider) {
    if (outerProvider.shouldConnect || !connect) {
      outerProvider.disconnect()
      COOPconnected.value = false
    }
    else {
      outerProvider.connect()
      COOPconnected.value = true
    }
  }
}

function switchLsp() {
  if (outerLanguageClient) {
    if (outerLanguageClient.state === State.Running) {
      outerLanguageClient.stop()
    }
    else if (outerLanguageClient.state === State.Stopped) {
      outerLanguageClient.start()
    }
  }
}

onMounted(async () => {
  configureMonacoWorkers();
  const {
    provider,
    languageClient,
  } = await runClient();
  outerProvider = provider
  outerLanguageClient = languageClient

  switchConnect()
  provider.awareness.on("change", () => {
    if (!provider.awareness.getLocalState()) {
      switchConnect(false)
    }
    else {
      updateConnectorStyle(
        Array.from(provider.awareness.meta.keys()),
        document.getElementById("yRemoteUserStyle") as HTMLStyleElement
      )
    }
  })
  languageClient.onDidChangeState((e) => {
    lspConnected.value = e.newState
  })
  languageClient.start()
  // lspSocket
})

onBeforeUnmount(() => {
  if (outerProvider) {
    outerProvider.disconnect()
  }
})
</script>

<style scoped>
.wrapper {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 1rem;
}
</style>