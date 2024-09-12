<template>
  <div class="wrapper">
    <div class="flex gap-1">
      <button type="button" @click="() => switchLspConnect()" :disabled="lspConnected === State.Starting">{{ lspText
        }}</button>
      <button type="button" @click="() => switchCoopConnect()" id="y-connect-btn">{{ coopConnected ? 'Disconnect-COOP' :
        'Connect-COOP'
        }}</button>
      <input type="text" id="y-name-input" placeholder="Name cannot change when connected" v-model="userName"
        :disabled="coopConnected">
    </div>
    <p></p>
    <p>This is a demo of the <a href="https://github.com/yjs/yjs">Yjs</a> + <a
        href="https://github.com/TypeFox/monaco-languageclient">Monaco Language Client</a> ⇔ <a
        href="https://microsoft.github.io/monaco-editor/">Monaco</a> binding: <a
        href="https://github.com/QingXia-Ela/y-monaco-lsp-example">y-monaco-lsp-example</a>.</p>
    <p>The content of this editor is shared with every client that visits this domain.</p>
    <p>Backend should running manually.</p>
    <p>Users: <code>{{ userText }}</code></p>
    <div id="monaco" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { State } from 'vscode-languageclient';
import { computed } from 'vue';
import { useServiceConnect } from './hooks/useServiceConnect'
import { onMounted } from 'vue';
import { watch } from 'vue';

const userName = ref("Ushio noa")

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

const {
  users,
  coopConnected,
  lspConnected,
  switchCoopConnect,
  switchLspConnect,
  initProvider,
  rerenderUsers,
} = useServiceConnect(
  userName,
  "ws://localhost:30002/yjs",
)

const userText = computed(() => {
  if (coopConnected.value) {
    return Array.from(new Set(users.value.map((u) => u.name))).join(', ')
  } else {
    return 'There is no user because you are not connected.'
  }
})

onMounted(() => {
  initProvider()
})

watch(lspConnected, (n) => {
  if (n) {
    setTimeout(() => {
      rerenderUsers()
    });
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