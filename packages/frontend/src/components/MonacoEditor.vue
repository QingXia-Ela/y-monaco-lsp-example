<template>
  <div class="wrapper">
    <div class="flex gap-1">
      <button type="button" @click="() => switchLsp()" :disabled="lspConnected === State.Starting">{{ lspText
        }}</button>
      <button type="button" @click="() => switchConnect()" id="y-connect-btn">{{ COOPconnected ? 'Disconnect-COOP' :
        'Connect-COOP'
        }}</button>
      <input type="text" id="y-name-input" placeholder="Name cannot change when connected" v-model="userName"
        :disabled="COOPconnected">
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
import { watch } from 'vue';

const COOPconnected = ref(false)
const lspConnected = ref<State>(State.Stopped)
const userName = ref("Ushio noa")
let outerProvider: WebsocketProvider | null = null
let outerLanguageClient: MonacoLanguageClient | null = null

watch(userName, (n) => {
  if (outerProvider) {
    // if client is disconnect but server doesn't know it.
    // use old clientID will cause document broken permanently.
    // so when reconnect happen, we should give it a new clientID.
    // or make server disconnect old socket.
    // in production, you should add a api to get a clientID safety to prevent conflict.
    // outerProvider.awareness.clientID = parseInt((Math.random() * 10000000000) as any)
    outerProvider.roomname = `?name=${n}&ydocClientId=${outerProvider.awareness.clientID}`
  }
})

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

async function updateUserList() {
  const res = await (await fetch('http://localhost:30002/users')).json() as Array<{
    name: string
    socketId: string
    ydocClientId: string
  }>

  return res
}

function switchConnect(connect = !COOPconnected.value) {
  if (!userName.value.length) {
    alert("Name cannot be empty")
    return
  }
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

let clearTimer: any = null

onMounted(async () => {
  configureMonacoWorkers();
  const {
    provider,
    languageClient,
  } = await runClient({
    name: userName.value,
  });
  outerProvider = provider
  outerLanguageClient = languageClient

  provider.awareness.on("change", () => {
    if (!provider.awareness.getLocalState()) {
      switchConnect(false)
    }
  })

  clearTimer = setInterval(() => {
    updateUserList().then((res) => {
      updateConnectorStyle(
        Array.from(res),
        document.getElementById("yRemoteUserStyle") as HTMLStyleElement
      )
    })
  }, 10000)

  languageClient.onDidChangeState((e) => {
    lspConnected.value = e.newState
  })
  languageClient.start()
})

onBeforeUnmount(() => {
  if (outerProvider) {
    outerProvider.disconnect()
  }
  clearInterval(clearTimer)
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