import { nanoid } from 'nanoid'
import { DragNodeType } from './Mouse.ts'

interface IDtdNode {
  dragId?: string;
  droppable?: boolean;
  props?: Record<string | number | symbol, any>;
  children: (DtdNode | any)[];
}

export enum NodeInPosition {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
  TOP_RIGHT = 'top_right',
  BOTTOM_RIGHT = 'bottom_right',
  BOTTOM_LEFT = 'bottom_left',
  TOP_LEFT = 'top_left'
}

const TreeNodes = new Map<string, DtdNode>();

export class DtdNode {
  root!: DtdNode;
  parent!: DtdNode;
  depth = 0;
  dragId!: string;
  droppable = false;
  props: IDtdNode['props'] = {};
  children: DtdNode[] = [];

  constructor(node: IDtdNode, parent?: DtdNode) {
    if (node instanceof DtdNode) {
      return node;
    }
    this.dragId = node.dragId || nanoid();
    if (parent) {
      this.depth = parent.depth + 1;
      this.parent = parent;
      this.root = parent.root;
    } else {
      this.droppable = true;
      this.root = this;
    }

    if (node) {
      this.props = node.props || node;
      if (node.droppable) this.droppable = node.droppable;
      this.children = (node?.children || []).map((child) => new DtdNode(child, this));
    }
    TreeNodes.set(this.dragId, this);
  }
}


export function deleteNode(node: DtdNode) {
  const parent = node.parent || node;
  parent.children = parent.children.filter((child) => child !== node);
}

/**
 * 插入到指定位置
 * @param targetNode 被插入节点
 * @param sourceNode 待插入节点
 * @param insertBefore
 * @param type
 */
export function insertNode(targetNode: DtdNode, sourceNode: DtdNode, insertBefore: boolean, type: DragNodeType) {
  if (!targetNode || !sourceNode) return;
  const parent = targetNode.parent || targetNode;
  parent.children.splice(
    parent.children.indexOf(targetNode) + (insertBefore ? 0 : 1),
    0,
    new DtdNode({...sourceNode, dragId: ''}, parent)
  );

  if (type === DragNodeType.MOVE) {
    // 删除原节点
    deleteNode(sourceNode);
  }
}

export function getNode(dragId: string) {
  if (!TreeNodes.has(dragId)) return null;
  return TreeNodes.get(dragId);
}

export function getClosetDroppableNode(dragId: string) {
  let node = getNode(dragId);
  while (node && !node.droppable) {
    node = node.parent;
  }
  return node;
}

export function  clearTreeNodes() {
  TreeNodes.clear();
}
