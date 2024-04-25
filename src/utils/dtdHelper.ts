
export function getClosestDtdNode(e: MouseEvent) {
  // 拖拽内元素
  const target = e.target as HTMLElement
  // 最近的含有data-dtd-id属性的元素
  return target.closest('[data-dtd-id]') as HTMLElement
}

export function getCursorPositionInDtdNode(e: MouseEvent) {
  const target = getClosestDtdNode(e)
  if (!target) return null
  const rect = target.getBoundingClientRect()
  const { clientX, clientY } = e
  const { left, top, width, height } = rect
  const isTop = clientY < top + height / 2
  const isLeft = clientX < left + width / 2
  const isRight = clientX > left + width / 2
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
