<script setup lang="ts">
import { DragToDropItemProps } from '../types'

defineProps<DragToDropItemProps>()
</script>

<template>
  <div
  :data-dtd-id="disabled ? undefined : data.dragId"
  class="drag-to-drop-item"
  :class="{ 'drag-disabled': disabled }"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
.drag-to-drop-item {
  padding: 10px;
  border: 1px solid #ccc;
  background-color: white;
}
.drag-disabled {
  opacity: 0.5;
}
</style>
