import { nanoid } from 'nanoid'
import { DragNodeType } from './Mouse.ts'
import { isValueInEnum } from '../utils/enum.ts';

interface IDtdNode {
  dragId?: string;
  droppable?: boolean;
  dragType?: DragNodeType;
  props?: Record<string | number | symbol, any>;
  children: IDtdNode[];
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
  dragType!: DragNodeType;
  droppable = false;
  disabled = false;
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
      if (node.dragType && isValueInEnum(node.dragType, DragNodeType)) this.dragType = node.dragType;
      else this.dragType = DragNodeType.MOVE;
      this.children = (node?.children || []).map((child) => new DtdNode(child, this));
    }
    TreeNodes.set(this.dragId, this);
  }

  static fromList(list: IDtdNode[]) {
    return new DtdNode({children: list});
  }

  static toList(node: DtdNode): any[]{
    return node.children.map((child) => {
      return {
        ...child.props,
        children: DtdNode.toList(child)
      };
    });
  }
}


export function deleteNode(node: DtdNode) {
  const parent = node.parent || node;
  parent.children = parent.children.filter((child) => child !== node);
  TreeNodes.delete(node.dragId);
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

/**
 * 插入到容器
 * @param targetNode 
 * @param sourceNode 
 * @param insertBefore 
 * @param type 
 * @returns 
 */
export function insertNodeInContainer(targetNode: DtdNode, sourceNode: DtdNode, insertBefore: boolean, type: DragNodeType) {
  if (!targetNode || !sourceNode) return;
  const newNode = new DtdNode({...sourceNode, dragId: ''}, targetNode)
  insertBefore ? targetNode.children.unshift(newNode) : targetNode.children.push(newNode);
  if (type === DragNodeType.MOVE) {
    // 删除原节点
    deleteNode(sourceNode);
  }
}

export function getNode(dragId: string) {
  if (!TreeNodes.has(dragId)) return undefined;
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
