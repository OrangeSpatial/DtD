import { DtdNode } from '../model/DtdNode'

export interface DragToDropProps {
  data: DtdNode;
}

export interface DragToDropItemProps {
  data: DtdNode;
  disabled?: boolean;
}
