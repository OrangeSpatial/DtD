<script setup lang="ts">
import { useCursor } from '../hooks/cursorHook.ts'
import { CSSProperties, onBeforeUnmount, onMounted, ref } from 'vue'
import { DragEventType } from '../model/Mouse.ts'
import { DtdNode } from '../model/DtdNode.ts'
import { cursorAtContainerEdge, getCursorPositionInDtdNode } from '../common/dtdHelper.ts'
import { initStyle } from '../common/presets.ts'

withDefaults(defineProps<{
  insertionBgColor: string
}>(), {
  insertionBgColor: '#1890ff'
})

const insertionStyle = ref<CSSProperties>()

const draggingCoverRectStyle = ref<CSSProperties>(initStyle)

const droppingCoverRectStyle = ref<CSSProperties>(initStyle)

const { mouse } = useCursor()
const currentTargetNode = ref<DtdNode>()

function draggingHandler(e: MouseEvent, targetNode?: DtdNode) {

  const positionObj = getCursorPositionInDtdNode(e)
  if (!positionObj || !targetNode) {
    resetInsertionStyle()
    resetDraggingCoverRectStyle()
    resetDroppingCoverRectStyle()
    return
  }
  currentTargetNode.value = targetNode
  const { isTop, rect } = positionObj
  // TODO: 根据布局判断，默认垂直布局
  const d_x = e.pageX - e.clientX
  const d_y = e.pageY - e.clientY
  const left = d_x + rect.left
  const top = d_y + rect.top
  const x = left
  const y = isTop ? top : top + rect.height
  if (targetNode.droppable && !cursorAtContainerEdge(rect, e)) {
    // 在可放置的容器内
    resetInsertionStyle()
    updateDroppingCoverRectStyle(rect, x, y)
  } else {
    updateInsertionStyle(rect, x, y)
    resetDroppingCoverRectStyle()
  }

  // same source should be a draggingCoverRect
  if (targetNode.root === mouse.dataTransfer?.root) {
    updateDraggingCoverRectStyle(d_x, d_y)
  } else {
    resetDraggingCoverRectStyle()
  }

}

function updateInsertionStyle(rect: DOMRect, x: number, y: number) {
  insertionStyle.value = {
    transform: `perspective(1px) translate3d(${x}px,${y}px,0px)`,
    width: rect.width + 'px',
    height: '2px'
  }
}

function updateDraggingCoverRectStyle(dx: number, dy: number) {
  const dragRect = mouse.dragElement?.getBoundingClientRect()
  if (dragRect) {
    draggingCoverRectStyle.value = {
      transform: `perspective(1px) translate3d(${dx + dragRect.left}px,${dy + dragRect.top}px,0px)`,
      width: dragRect.width + 'px',
      height: dragRect.height + 'px'
    }
  }
}

function updateDroppingCoverRectStyle(dropRect: DOMRect, x: number, y: number) {
  droppingCoverRectStyle.value = {
    transform: `perspective(1px) translate3d(${x}px,${y}px,0px)`,
    width: dropRect.width + 'px',
    height: dropRect.height + 'px'
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
  draggingCoverRectStyle.value = initStyle
}

function resetDroppingCoverRectStyle() {
  droppingCoverRectStyle.value = initStyle
}


function dragEndHandler() {
  resetInsertionStyle()
  resetDraggingCoverRectStyle()
  currentTargetNode.value = undefined
}

onMounted(() => {
  mouse.on(DragEventType.Dragging, draggingHandler)
  mouse.on(DragEventType.DragEnd, dragEndHandler)
})

onBeforeUnmount(() => {
  mouse.off(DragEventType.Dragging, draggingHandler)
  mouse.off(DragEventType.DragEnd, dragEndHandler)
})
</script>

<template>
  <div class="dtd-aux-tool">
    <div class="dtd-aux-insertion"
      :style="{...insertionStyle, backgroundColor: insertionBgColor}"
    ></div>
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
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 2;
}

.dtd-aux-insertion {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  transform: perspective(1px);
}

.dtd-aux-cover-rect {
  pointer-events: none;
  position: absolute;
  background-color: rgba(0, 147, 251, 0.1);
  transform: perspective(1px) translateZ(0);
}

.dtd-aux-cover-rect.dragging {
  box-sizing: border-box;
  border: 1px solid #0093fb;
}
</style>
