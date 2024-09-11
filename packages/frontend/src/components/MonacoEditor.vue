<template>
  <div class="wrapper">
    <div class="flex gap-1">
      <button type="button" @click="() => switchConnect()" id="y-connect-btn">{{ COOPconnected ? 'Disconnect-COOP' :
        'Connect-COOP'
        }}</button>
      <input type="text" id="y-name-input" placeholder="Your name">
      <button type="button" id="y-set-btn">Set Name</button>
    </div>
    <p></p>
    <!-- <p>This is a demo of the <a href="https://github.com/yjs/yjs">Yjs</a> ⇔ <a
        href="https://microsoft.github.io/monaco-editor/">Monaco</a> binding: <a
        href="https://github.com/yjs/y-monaco">y-monaco</a>.</p>
    <p>The content of this editor is shared with every client that visits this domain.</p> -->
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

const COOPconnected = ref(false)
let outerProvider: WebsocketProvider | null = null

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

onMounted(async () => {
  configureMonacoWorkers();
  const {
    provider
  } = await runClient();
  outerProvider = provider

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
  // wrapper.
})

onBeforeUnmount(() => {
  if (outerProvider) {
    outerProvider.disconnect()
  }
})
</script>

<style scoped>
.wrapper {
  width: 100%;
  height: 100%;
}
</style>