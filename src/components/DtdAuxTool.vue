<script setup lang="ts">
import { useCursor } from '../hooks/cursorHook.ts'
import { CSSProperties, onMounted, ref } from 'vue'
import { DragEventType, ICursorPosition } from '../model/Mouse.ts'
import { DtdNode } from '../model/DtdNode.ts'
import { getClosestDtdNode, getCursorPositionInDtdNode } from '../utils/dtdHelper.ts'

const insertionStyle = ref<CSSProperties>({
  top: '0',
  left: '0',
  width: '0',
  height: '0'
})

const draggingCoverRectStyle = ref<CSSProperties>({
  top: '0',
  left: '0',
  width: '0',
  height: '0'
})

const droppingCoverRectStyle = ref<CSSProperties>({
  top: '0',
  left: '0',
  width: '0',
  height: '0'
})

const { mouse } = useCursor()
const currentTargetNode = ref<DtdNode>()

function draggingHandler(e: MouseEvent, targetNode: DtdNode, position: ICursorPosition) {
  // console.log('mouseMoveHandler', e, targetNode, position)
  currentTargetNode.value = targetNode
  const positionObj = getCursorPositionInDtdNode(e)
  if (!positionObj) return
  const { isTop, rect } = positionObj
  const y = isTop ? rect.top : rect.top + rect.height
  if (!targetNode) return
  if (!targetNode.droppable) {
    updateInsertionStyle(rect, y)
    resetDroppingCoverRectStyle()
  } else {
    resetInsertionStyle()
    // 在可放置的容器内
    updateDroppingCoverRectStyle(getClosestDtdNode(e))
  }

  // 同一来源的节点需要展示draggingCoverRect
  if (targetNode.root === currentTargetNode.value.root) {
    updateDraggingCoverRectStyle()
  } else {
    resetDraggingCoverRectStyle()
  }

}

function updateInsertionStyle(rect: DOMRect, y: number) {
  insertionStyle.value = {
    top: 0 + 'px',
    left: 0 + 'px',
    transform: `perspective(1px) translate3d(${rect.left}px,${y}px,0px)`,
    width: rect.width + 'px',
    height: '2px'
  }
}

function updateDraggingCoverRectStyle() {
  const dragRect = mouse.dragElement?.getBoundingClientRect()
  if (dragRect) {
    draggingCoverRectStyle.value = {
      transform: `perspective(1px) translate3d(${dragRect.left}px,${dragRect.top}px,0px)`,
      width: dragRect.width + 'px',
      height: dragRect.height + 'px'
    }
  }
}

function updateDroppingCoverRectStyle(el: HTMLElement) {
  const dropRect = el?.getBoundingClientRect()
  if (dropRect) {
    droppingCoverRectStyle.value = {
      transform: `perspective(1px) translate3d(${dropRect.left}px,${dropRect.top}px,0px)`,
      width: dropRect.width + 'px',
      height: dropRect.height + 'px'
    }
  }
}

function resetInsertionStyle() {
  insertionStyle.value = {
    top: 0,
    left: 0,
    transform: `perspective(1px) translate3d(0px,0px,0px)`,
  }
}

function resetDraggingCoverRectStyle() {
  draggingCoverRectStyle.value = {
    top: 0,
    left: 0,
    width: 0,
    height: 0
  }
}

function resetDroppingCoverRectStyle() {
  droppingCoverRectStyle.value = {
    top: 0,
    left: 0,
    width: 0,
    height: 0
  }
}


function dragEndHandler(e: MouseEvent, targetNode: DtdNode, position: ICursorPosition) {
  // console.log('dragEndHandler', e, targetNode, position)
  resetInsertionStyle()
  resetDraggingCoverRectStyle()
  currentTargetNode.value = undefined
}

onMounted(() => {
  mouse.on(DragEventType.Dragging, draggingHandler)
  mouse.on(DragEventType.DragEnd, dragEndHandler)
})

</script>

<template>
  <div class="dtd-aux-tool">
    <div class="dtd-aux-insertion" :style="insertionStyle"></div>
    <div class="dtd-aux-dashed-box"></div>
    <div class="dtd-aux-selection-box"></div>
    <div v-if="mouse.dataTransfer" class="dtd-aux-cover-rect dragging" :style="draggingCoverRectStyle"></div>
    <div v-if="currentTargetNode?.droppable" class="dtd-aux-cover-rect dropping" :style="droppingCoverRectStyle"></div>
  </div>
</template>

<style scoped>
.dtd-aux-tool {
  transform: perspective(1px) translateZ(0);
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 2;
}

.dtd-aux-insertion {
  position: absolute;
  transform: perspective(1px);
  background-color: #00bebe;
}

.dtd-aux-cover-rect {
  pointer-events: none;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.1);
  transform: perspective(1px) translateZ(0);
}
</style>
