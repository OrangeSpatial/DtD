<script setup lang="ts">
import { DtdNode } from '../model/DtdNode.ts'
import { initCursor } from '../hooks/cursorHook.ts'
import DtdAuxTool from './DtdAuxTool.vue'

const props = defineProps<{
  root: DtdNode
}>()
initCursor(props.root)
</script>

<template>
  <div class="drag-to-drop">
    <slot></slot>
  </div>
  <dtd-aux-tool />
</template>

<style scoped>
.drag-to-drop {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
