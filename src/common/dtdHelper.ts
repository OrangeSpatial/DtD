import { ICursorPosition } from "../model/Mouse"
import { DTD_BASE_KEY, edgeGap } from "./presets"

export function getClosestDtdNode(e: MouseEvent) {
  // 拖拽内元素
  const target = e.target as HTMLElement
  return target.closest(`[${DTD_BASE_KEY}]`) as HTMLElement
}

export function getCursorPositionInDtdNode(e: MouseEvent) {
  const target = getClosestDtdNode(e)
  if (!target) return null
  const rect = target.getBoundingClientRect()
  const { clientX, clientY } = e
  const { left, top, width, height } = rect
  const isTop = clientY < top + height / 2
  const isLeft = clientX < left + width / 3
  const isRight = clientX > left + width / 3
  const isBottom = clientY > top + height / 2
  return {
    rect,
    isTop,
    isLeft,
    isRight,
    isBottom,
    insertBefore: isTop && isLeft,
  }
}

export function cursorAtContainerEdge(rect: DOMRect, e: MouseEvent) {
  return (e.clientY - rect.top < edgeGap) || (rect.top + rect.height - e.clientY  < edgeGap)
  || (e.clientX - rect.left < edgeGap) || (rect.left + rect.width - e.clientX < edgeGap)
}

export function setMoveElStyle(el: HTMLElement, position: ICursorPosition) {
  if(!el) return
  const { pageX, pageY } = position
  el.style.height = 'auto'
  el.style.width = 'auto'
  el.style.transform = `perspective(1px) translate3d(${pageX}px, ${pageY}px, 0)`
}

export function removeGhostElStyle(el: HTMLElement) {
  if(!el) return
  el.style.height = '0'
  el.style.width = '0'
  el.style.transform = `perspective(1px) translate3d(0, 0, 0)`
}
