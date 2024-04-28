import { DtdNode, getNode } from './DtdNode.ts'
import { getClosestDtdNode, removeGhostElStyle, setMoveElStyle } from '../common/dtdHelper.ts'
import { isValidNumber } from '../common/types.ts'
import { DTD_BASE_KEY } from '../common/presets.ts'

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

  dragPositionChangeCallbacks = new Map<string, ((e: MouseEvent, targetNode?: DtdNode) => void)[]>()

  node: DtdNode | null = null

  constructor() {
    // 设置默认拖拽元素
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

  public setGhostElement(ghostElement: HTMLElement): void {
    if (!ghostElement) return;
    this.ghostElement && this.ghostElement.remove();
    this.ghostElement = ghostElement;
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
    if (this.dragElement && this.ghostElement) {
      setMoveElStyle(this.ghostElement, position);
    }
  }

  on(eventType: DragEventType, callback: (e: MouseEvent, targetNode?: DtdNode) => void) {
    if (!eventType || !callback) return;
    if (this.dragPositionChangeCallbacks.has(eventType)) {
      if (this.dragPositionChangeCallbacks.get(eventType)?.includes(callback)) return;
      this.dragPositionChangeCallbacks.get(eventType)?.push(callback);
    } else {
      this.dragPositionChangeCallbacks.set(eventType, [callback]);
    }
  }

  off(eventType: DragEventType, callback: (e: MouseEvent, targetNode: DtdNode) => void) {
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
    const dragElement = getClosestDtdNode(e)
    if (!dragElement) return;
    this.setDragStatus(CursorStatus.Dragging);
    this.setDragStartPosition({
      pageX: e.pageX,
      pageY: e.pageY,
      clientX: e.clientX,
      clientY: e.clientY,
    });
    // 设置样式
    setCursorStyle(window, CursorDragType.Grabbing);
    this.dragElement = dragElement;
    // 设置数据
    const dragId = dragElement?.getAttribute(DTD_BASE_KEY);
    if (dragId) {
      // 正在拖拽的node
      const node = getNode(dragId);
      if (node) {
        this.dataTransfer = node;
        this.dragPositionChangeCallbacks.get(DragEventType.DragStart)?.forEach((cb) => {
          cb(e, node);
        });
      }
    }
  }
  onDragMove(e: MouseEvent) {
    if (this.dragStatus !== CursorStatus.Dragging) return;
    e.preventDefault();
    this.setCursorPosition({
      pageX: e.pageX,
      pageY: e.pageY,
      clientX: e.clientX,
      clientY: e.clientY,
    });

    const target = getClosestDtdNode(e) as HTMLElement;
    const dragId = target?.getAttribute(DTD_BASE_KEY) as string;
    const targetNode = getNode(dragId);
    this.dragPositionChangeCallbacks.get(DragEventType.Dragging)?.forEach((cb) => {
      cb(e, targetNode);
    });
  }

  onDragEnd(e: MouseEvent) {
    // 设置样式
    setCursorStyle(window, CursorDragType.Auto)
    if (this.dragStatus !== CursorStatus.Dragging) return;
    this.setDragStatus(CursorStatus.Normal);
    this.setDragEndPosition({
      pageX: e.pageX,
      pageY: e.pageY,
      clientX: e.clientX,
      clientY: e.clientY,
    });
    // 事件
    this.dragPositionChangeCallbacks.get(DragEventType.DragEnd)?.forEach((cb) => {
      const dragId = getClosestDtdNode(e)?.getAttribute(DTD_BASE_KEY) as string;
      const targetNode = getNode(dragId);
      cb(e, targetNode);
    });
      // 移除拖拽元素
    if (this.dragElement) {
      this.dragElement = null;
    }

    if (this.dataTransfer) {
      this.dataTransfer = null;
    }
    if (this.ghostElement) {
      removeGhostElStyle(this.ghostElement);
    }
  }

  public move = (e: MouseEvent) =>  {
    if (this.isValidDragStart(e)) {
      this.onDragStart(e);
      this.onDragMove(e);
    }
  }

  public down = (e: MouseEvent) => {
    this.startEvent = e;
    this.startTime = Date.now();
    document.addEventListener('mousemove', this.move);
    document.addEventListener('mouseup', this.up);
  }

  public up = (e: MouseEvent) => {
    this.onDragEnd(e);
    document.removeEventListener('mousemove', this.move);
    document.removeEventListener('mouseup', this.up);
  }
}
