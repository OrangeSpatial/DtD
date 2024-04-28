<script setup lang="ts">
import { onMounted, ref } from 'vue';
const ghostRef = ref<HTMLElement>()
const emits = defineEmits(['mounted'])

onMounted(() => {
  ghostRef.value && emits('mounted', ghostRef.value)
})
</script>

<template>
<div ref="ghostRef" class="dtd-ghost">
  <slot></slot>
</div>
</template>

<style scoped>
.dtd-ghost {
  transform: perspective(1px) translateZ(0);
  position: absolute;
  top: 0;
  left: 0;
  height: 0;
  pointer-events: none;
  z-index: 999;
}
</style>
