import { Mouse } from '../model/Mouse.ts'
import { DtdNode } from '../model/DtdNode.ts'
import { onBeforeUnmount, onMounted } from 'vue'

const mouse = new Mouse()

export function initCursor(node: DtdNode) {

  mouse.setNode(node)

  onMounted(() => {
    document.addEventListener('mousedown', mouse.down)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', mouse.down)
  })

  return {
    mouse,
  }
}

export function useCursor() {
  return {
    mouse,
  }
}
