<template>
  <div id="monaco"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { configureMonacoWorkers, runClient } from '../monaco/client-new'
onMounted(async () => {
  configureMonacoWorkers();
  await runClient();

  // wrapper.
})
</script>

<style scoped></style>