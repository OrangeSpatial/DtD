import { DtdNode, getClosetDroppableNode, getNode, insertNode, NodeInPosition } from './DtdNode.ts'
import { getClosestDtdNode, getCursorPositionInDtdNode } from '../utils/dtdHelper.ts'
import { isValidNumber } from '../utils/types.ts'

export enum CursorStatus {
  Normal = 'NORMAL',
  Dragging = 'DRAGGING',
}
export enum CursorDragType {
  Grabbing = 'GRABBING',
  Move = 'MOVE',
  Resize = 'RESIZE',
  Rotate = 'ROTATE',
  Scale = 'SCALE',
  Translate = 'TRANSLATE',
  Round = 'ROUND',
  Auto = 'AUTO',
}

export enum DragEventType {
  DragStart = 'dragstart',
  Dragging = 'dragging',
  DragEnd = 'dragend',
}

export enum DragNodeType {
  MOVE = 'move',
  COPY = 'copy'
}

export interface ICursorPosition {
  pageX?: number

  pageY?: number

  clientX?: number

  clientY?: number

  topPageX?: number

  topPageY?: number

  topClientX?: number

  topClientY?: number
}

const DEFAULT_POSITION = {
  pageX: 0,
  pageY: 0,
  clientX: 0,
  clientY: 0,
  topPageX: 0,
  topPageY: 0,
  topClientX: 0,
  topClientY: 0,
}

const setCursorStyle = (contentWindow: Window, style: string) => {
  const currentRoot = document?.getElementsByTagName?.('html')?.[0]
  const root = contentWindow?.document?.getElementsByTagName('html')?.[0]
  if (root && root.style.cursor !== style) {
    root.style.cursor = style
  }
  if (currentRoot && currentRoot.style.cursor !== style) {
    currentRoot.style.cursor = style
  }
}

export class Mouse {
  position: ICursorPosition = DEFAULT_POSITION
  dragStartPosition: ICursorPosition = DEFAULT_POSITION
  dragEndPosition: ICursorPosition = DEFAULT_POSITION
  dragStatus: CursorStatus | string = CursorStatus.Normal;

  dragElement: HTMLElement | null = null

  ghostElement: HTMLElement

  dataTransfer: DtdNode | null = null

  startEvent: MouseEvent = new MouseEvent('')
  startTime: number = 0

  dragPositionChangeCallbacks = new Map<string, ((e: MouseEvent, targetNode: DtdNode, position: ICursorPosition) => void)[]>()

  node: DtdNode | null = null

  constructor() {
    // 设置拖拽元素
    const ghostElement = document.createElement('div');
    ghostElement.style.position = 'absolute';
    ghostElement.style.zIndex = '9999';
    ghostElement.style.pointerEvents = 'none';
    this.ghostElement = ghostElement;
    document.body.appendChild(ghostElement);
  }

  public setNode(node: DtdNode): void {
    this.node = node;
  }

  public setDragStatus(status: CursorStatus | string): void {
    this.dragStatus = status;
  }

  public setDragStartPosition(position: ICursorPosition): void {
    this.dragStartPosition = position;
  }

  public setDragEndPosition(position: ICursorPosition): void {
    this.dragEndPosition = position;
  }

  public setCursorPosition(position: ICursorPosition): void {
    this.position = position;
    if (this.dragElement) {
      this.ghostElement.style.left = `${position.clientX}px`;
      this.ghostElement.style.top = `${position.clientY}px`;
    }
  }

  on(eventType: DragEventType, callback: (e: MouseEvent, targetNode: DtdNode, position: ICursorPosition) => void) {
    if (!eventType || !callback) return;
    if (this.dragPositionChangeCallbacks.has(eventType)) {
      this.dragPositionChangeCallbacks.get(eventType)?.push(callback);
    } else {
      this.dragPositionChangeCallbacks.set(eventType, [callback]);
    }
  }

  off(eventType: DragEventType, callback: (e: MouseEvent, targetNode: DtdNode, position: ICursorPosition) => void) {
    if (!eventType || !callback) return;
    if (this.dragPositionChangeCallbacks.has(eventType)) {
      const callbacks = this.dragPositionChangeCallbacks.get(eventType);
      const index = callbacks?.findIndex((cb) => cb === callback);
      if (isValidNumber(index) && index !== -1) {
        callbacks?.splice(index, 1);
      }
    }
  }

  isValidDragStart(e: MouseEvent) {
    const distance = Math.sqrt(
      Math.pow(e.pageX - this.startEvent.pageX, 2) +
      Math.pow(e.pageY - this.startEvent.pageY, 2)
    )
    const timeDelta = Date.now() - this.startTime
    return distance > 5 && e !== this.startEvent && timeDelta > 10;
  }

  onDragStart(e: MouseEvent) {
    if (this.dragStatus === CursorStatus.Dragging) return;
    console.log('dragStart', e);
    this.setDragStatus(CursorStatus.Dragging);
    this.setDragStartPosition({
      pageX: e.pageX,
      pageY: e.pageY,
      clientX: e.clientX,
      clientY: e.clientY,
    });
    // 设置样式
    setCursorStyle(window, CursorDragType.Grabbing);
    const dragElement = getClosestDtdNode(e)
    if (dragElement) {
      this.dragElement = dragElement;
      // 设置拖拽元素
      this.ghostElement.append(dragElement?.cloneNode(true));
    }
    // 设置数据
    const dragId = dragElement?.getAttribute('data-dtd-id');
    if (dragId) {
      // 正在拖拽的node
      const node = getNode(dragId);
      if (node) {
        this.dataTransfer = node;
        this.dragPositionChangeCallbacks.get(DragEventType.DragStart)?.forEach((cb) => {
          cb(e, node, this.position);
        });
      }
    }
  }
  onDragMove(e: MouseEvent) {
    if (this.dragStatus !== CursorStatus.Dragging) return;
    this.setCursorPosition({
      pageX: e.pageX,
      pageY: e.pageY,
      clientX: e.clientX,
      clientY: e.clientY,
    });
    // 判断鼠标在哪个元素上，且在元素上的位置：上、下、左、右
    const target = getClosestDtdNode(e) as HTMLElement;
    if (target) {
      const dragId = target.getAttribute('data-dtd-id') as string;
      const targetNode = getNode(dragId);
      if (targetNode)  {
        this.dragPositionChangeCallbacks.get(DragEventType.Dragging)?.forEach((cb) => {
          cb(e, targetNode, this.position);
        });
      }
    }
  }

  onDragEnd(e: MouseEvent) {
    if (this.dragStatus !== CursorStatus.Dragging) return;
    this.setDragStatus(CursorStatus.Normal);
    this.setDragEndPosition({
      pageX: e.pageX,
      pageY: e.pageY,
      clientX: e.clientX,
      clientY: e.clientY,
    });
    // 设置样式
    setCursorStyle(window, CursorDragType.Auto)
    const currentTargetEl = getClosestDtdNode(e);
    const dragId = currentTargetEl?.getAttribute('data-dtd-id') as string;
    const targetNode = getNode(dragId);
    // 如果在容器上，直接追加，如果不在容器内，查找上级容器,并计算插入位置
    if (this.dragElement) {
      if (targetNode?.droppable) {
        currentTargetEl.append(this.dragElement.cloneNode(true));
        // 更新节点
        targetNode.children.push(new DtdNode({...targetNode, dragId: ''}, targetNode))
        console.log(targetNode.root);
      } else {
        const positionObj = getCursorPositionInDtdNode(e)
        if (positionObj && targetNode) {
          const dragType = targetNode.root === this.dataTransfer?.root ? DragNodeType.MOVE : DragNodeType.COPY;
          insertNode(targetNode, this.dataTransfer as DtdNode, positionObj.insertBefore, dragType)

          const dragEL = dragType === DragNodeType.MOVE ? this.dragElement : this.dragElement.cloneNode(true);
          if (positionObj.insertBefore) {
            currentTargetEl.before(dragEL);
          } else {
            currentTargetEl.after(dragEL);
          }
        }
      }
      // 移除拖拽元素
      this.dragElement = null;
    }

    if (this.dataTransfer) {
      this.dataTransfer = null;
    }
    if (this.ghostElement) {
      this.ghostElement.innerHTML = '';
    }
    this.dragPositionChangeCallbacks.get(DragEventType.DragEnd)?.forEach((cb) => {
      const dragId = getClosestDtdNode(e)?.getAttribute('data-dtd-id') as string;
      const targetNode = getNode(dragId);
      if (targetNode) {
        cb(e, targetNode, this.position);
      }
    });
  }

  public move = (e: MouseEvent) =>  {
    e.preventDefault();
    if (this.isValidDragStart(e)) {
      this.onDragStart(e);
      this.onDragMove(e);
    }
  }

  public down = (e: MouseEvent) => {
    console.log('down', e);
    this.startEvent = e;
    this.startTime = Date.now();
    // 监听鼠标移动事件和鼠标抬起事件
    document.addEventListener('mousemove', this.move);
    document.addEventListener('mouseup', this.up);
  }

  public up = (e: MouseEvent) => {
    console.log('up', e);
    this.onDragEnd(e);
    // 移除鼠标移动事件和鼠标抬起事件
    document.removeEventListener('mousemove', this.move);
    document.removeEventListener('mouseup', this.up);
  }
}
