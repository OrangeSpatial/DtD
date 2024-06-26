<script setup lang="ts">
import { DtdNode, NodeLayout, insertNode, insertNodeInContainer } from '../model/DtdNode.ts'
import { initCursor } from '../hooks/cursorHook.ts'
import DtdAuxTool from './DtdAuxTool.vue'
import Dtd from './Dtd.vue'
import DtdGhost from './DtdGhost.vue'
import { computed, onBeforeUnmount, ref } from 'vue';
import { DragEventType } from '../model/Mouse';
import { cursorAtContainerEdge, getCursorPositionInDtdNode } from '../common/dtdHelper.ts';

defineOptions({
  name: 'DragToDrop',
})

const props = withDefaults(defineProps<{
  modelValue: any[]
  key: string
  nodeClass?: string
}>(), {
  key: 'id'
})
const emits = defineEmits<{
  (event: 'update:modelValue', value: Array<any>): void
}>()
const dtdData = computed({
  get: () => {
    return DtdNode.fromList(props.modelValue || [])
  },
  set: (value) => {
    emits('update:modelValue', DtdNode.toList(value))
  }
})

const { mouse } = initCursor(dtdData.value)
mouse.on(DragEventType.DragEnd, dragEndHandler)
function dragEndHandler(e: MouseEvent, targetNode?: DtdNode) {
  const sourceNode = mouse.dataTransfer
  const positionObj = getCursorPositionInDtdNode(e)
  carryNode.value = undefined
  if (!targetNode || !sourceNode || !positionObj || !mouse.dragElement) return
  const dragType = sourceNode.dragType
  const isContainerEdge = cursorAtContainerEdge(positionObj.rect, e)
  const isVertical = targetNode.nodeInLayout === NodeLayout.VERTICAL
  const insertBefore = isVertical ? positionObj.insertBefore : positionObj.isLeft
  if (targetNode?.droppable && !isContainerEdge) {
    insertNodeInContainer(targetNode, sourceNode, insertBefore, dragType)
  } else {
    insertNode(targetNode, sourceNode, isVertical ? positionObj.isTop : positionObj.isLeft, dragType)
  }
  dtdData.value = targetNode.root
}

const carryNode = ref<DtdNode>()

mouse.on(DragEventType.DragStart, () => {
  carryNode.value = mouse.dataTransfer as DtdNode
})

function ghostMounted(el: HTMLElement) {
  mouse.setGhostElement(el)
}

onBeforeUnmount(() => {
  mouse.off(DragEventType.DragEnd, dragEndHandler)
})

function init() {
  if(!props.key && !props.modelValue?.[0].id) {
    console.error('DragToDrop: key is required')
  }
}

init()
</script>

<template>
  <Dtd :key="key" :nodeClass :node="dtdData">
    <template #default="{ item }">
      <slot :item="item" />
    </template>
  </Dtd>
  <dtd-aux-tool />
  <dtd-ghost @mounted="ghostMounted">
    <slot name="ghost" v-if="carryNode" :item="carryNode?.props"/>
  </dtd-ghost>
</template>

<style scoped>
.drag-to-drop {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
