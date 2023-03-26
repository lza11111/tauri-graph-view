import { Graph, Node } from "@antv/x6";

// 节点类型
export enum NodeType {
    DATA = 'DATA', // 数据输入
    PROCESS = 'PROCESS', // 数据过滤
}

// 元素校验状态
export enum CellStatus {
    DEFAULT = 'default',
    SUCCESS = 'success',
    ERROR = 'error',
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

// 不同节点类型的icon
export const NODE_TYPE_LOGO = {
  INPUT:
        'https://mdn.alipayobjects.com/huamei_f4t1bn/afts/img/A*RXnuTpQ22xkAAAAAAAAAAAAADtOHAQ/original', // 数据输入
  FILTER:
        'https://mdn.alipayobjects.com/huamei_f4t1bn/afts/img/A*ZJ6qToit8P4AAAAAAAAAAAAADtOHAQ/original', // 数据筛选
  JOIN: 'https://mdn.alipayobjects.com/huamei_f4t1bn/afts/img/A*EHqyQoDeBvIAAAAAAAAAAAAADtOHAQ/original', // 数据连接
  UNION:
        'https://mdn.alipayobjects.com/huamei_f4t1bn/afts/img/A*k4eyRaXv8gsAAAAAAAAAAAAADtOHAQ/original', // 数据合并
  AGG: 'https://mdn.alipayobjects.com/huamei_f4t1bn/afts/img/A*TKG8R6nfYiAAAAAAAAAAAAAADtOHAQ/original', // 数据聚合
  OUTPUT:
        'https://mdn.alipayobjects.com/huamei_f4t1bn/afts/img/A*zUgORbGg1HIAAAAAAAAAAAAADtOHAQ/original', // 数据输出
};

// 节点状态列表
export const nodeStatusList = [
  {
    id: 'node-0',
    status: 'success',
  },
  {
    id: 'node-1',
    status: 'success',
  },
  {
    id: 'node-2',
    status: 'success',
  },
  {
    id: 'node-3',
    status: 'success',
  },
  {
    id: 'node-4',
    status: 'error',
    statusMsg: '错误信息示例',
  },
];

// 边状态列表
export const edgeStatusList = [
  {
    id: 'edge-0',
    status: 'success',
  },
  {
    id: 'edge-1',
    status: 'success',
  },
  {
    id: 'edge-2',
    status: 'success',
  },
  {
    id: 'edge-3',
    status: 'success',
  },
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