import { Graph, Node } from "@antv/x6";

// 节点类型
export enum NodeType {
    DATA = 'DATA', // 数据输入
    PROCESS = 'PROCESS', // 数据过滤
}

// 节点位置信息
export interface Position {
    x: number
    y: number
}

// 加工类型列表
export const PROCESSING_TYPE_LIST: { type: NodeType, name: string }[] = [
  {
    type: NodeType.DATA,
    name: 'DATA',
  },
  {
    type: NodeType.PROCESS,
    name: 'PROCESS',
  }
];

export interface NodeData {
    id: string;
    name: string;
    type: string;
    privacyType?: string;
    platform?: string;
    region?: string;
    serviceId?: string;
    path?: string;
    inputIdList?: string[];
    outputIdList?: string[];
}

export interface ReactNodeProps {
    node: Node;
    graph: Graph;
}

export const embedPadding = 20;

export const DATA_LINEAGE_DAG_NODE = 'data-lineage-dag-node';
export const PLATFORM_GROUP_NODE = 'platform-group-node';
