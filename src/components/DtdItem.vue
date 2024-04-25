<script setup lang="ts">
import { onMounted } from 'vue'
import { DragToDropItemProps } from '../types'

const props = defineProps<DragToDropItemProps>()

onMounted(() => {
  console.log('DragToDrop mounted')
})

</script>

<template>
  <div :data-dtd-id="disabled ? undefined : data.dragId" class="drag-to-drop-item">
    <slot></slot>
  </div>
</template>

<style scoped>
.drag-to-drop-item {
  padding: 10px;
  border: 1px solid #ccc;
  background-color: white;
}
</style>
