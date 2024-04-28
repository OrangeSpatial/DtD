<script setup lang="ts">
import { computed } from 'vue';
import { DragToDropItemProps } from '../types'
import { DTD_BASE_KEY } from '../common/presets';
const props = defineProps<DragToDropItemProps>()
const customProps = computed( () => {
  return {
    [DTD_BASE_KEY]: props.disabled ? undefined : props.data.dragId
  }
})
</script>

<template>
  <div
  v-bind="customProps"
  class="drag-to-drop-item"
  :class="{
    'drag-disabled': disabled
  }"
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
