import { DtdNode } from '../model/DtdNode'

export interface DragToDropProps {
  data: DtdNode;
}

export interface DragToDropListProps {
  list: DtdNode[];
  disabled?: boolean;
}


export interface DragToDropItemProps {
  data: DtdNode;
  disabled?: boolean;
}
