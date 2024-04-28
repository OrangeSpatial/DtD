<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { DragToDropItemProps } from '../types'
import { DTD_BASE_KEY } from '../common/presets';
import { NodeLayout } from '../model/DtdNode';
const props = defineProps<DragToDropItemProps>()
const customProps = computed( () => {
  return {
    [DTD_BASE_KEY]: props.disabled ? undefined : props.data.dragId
  }
})

const nodeRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (nodeRef.value) {
    const nodeParentELStyle = getComputedStyle(nodeRef.value.parentElement!)
    // support for flex and grid layout
    if (nodeParentELStyle.display === 'flex' && nodeParentELStyle.flexDirection === 'row') {
      props.data.setNodeInLayout(NodeLayout.HORIZONTAL)
    }
    if (nodeParentELStyle.display === 'grid' && nodeParentELStyle.gridTemplateColumns) {
      props.data.setNodeInLayout(NodeLayout.HORIZONTAL)
    }
  }
})
</script>

<template>
  <div
  ref="nodeRef"
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
