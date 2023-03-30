import { Graph, Node, Edge, StringExt, Cell } from '@antv/x6';
import dagre from 'dagre';
import { DATA_LINEAGE_DAG_NODE, NodeData, NodeType, PLATFORM_GROUP_NODE, Position } from './definetion';
import styles from './styles.module.scss';

/**
 * 根据起点初始下游节点的位置信息
 * @param node 起始节点
 * @param graph
 * @returns
 */
export const getDownstreamNodePosition = (
  node: Node,
  graph: Graph,
  dx = 250,
  dy = 100,
) => {
  // 找出画布中以该起始节点为起点的相关边的终点id集合
  const downstreamNodeIdList: string[] = [];
  graph.getEdges().forEach((edge) => {
    const originEdge = edge.toJSON()?.data;
    if (originEdge.source === node.id) {
      downstreamNodeIdList.push(originEdge.target);
    }
  });
  // 获取起点的位置信息
  const position = node.getPosition();
  let minX = Infinity;
  let maxY = -Infinity;
  graph.getNodes().forEach((graphNode) => {
    if (downstreamNodeIdList.indexOf(graphNode.id) > -1) {
      const nodePosition = graphNode.getPosition();
      // 找到所有节点中最左侧的节点的x坐标
      if (nodePosition.x < minX) {
        minX = nodePosition.x;
      }
      // 找到所有节点中最x下方的节点的y坐标
      if (nodePosition.y > maxY) {
        maxY = nodePosition.y;
      }
    }
  });

  return {
    x: minX !== Infinity ? minX : position.x + dx,
    y: maxY !== -Infinity ? maxY + dy : position.y,
  };
};

/**
* 创建节点并添加到画布
* @param type 节点类型
* @param graph
* @param position 节点位置
* @returns
*/
export const createNode = (
  type: NodeType,
  graph: Graph,
  data: NodeData,
  position?: Position,
) => {
  if (!graph) {
    return null;
  }
  const node: Node.Metadata = {
    id: data.id,
    shape: DATA_LINEAGE_DAG_NODE,
    x: position?.x,
    y: position?.y,
    ports: getPortsByType(type, data.id),
    data: data,
  };
  return graph.addNode(node);
};

/**
* 创建框选(父节点)并添加到画布
* @param graph
* @param label
* @param children
* @returns
*/
export const createGroup = (
  graph: Graph,
  label: string,
) => {
  if (!graph || graph.hasCell(label)) {
    return null;
  }
  const random = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1) + a);
  const randomColor = `rgb(${random(120, 255)}, ${random(120, 255)}, ${random(120, 255)})`;
  const node: Node.Metadata = {
    id: label,
    shape: PLATFORM_GROUP_NODE,
    zIndex: 0,
    data: {
      platform: label,
      color: randomColor,
    }
  };
  return graph.addNode(node);
};


/**
 * 创建边并添加到画布
 * @param source
 * @param target
 * @param graph
 */
export const createEdge = (source: string, target: string, graph: Graph) => {
  const edge = {
    id: StringExt.uuid(),
    shape: 'data-processing-curve',
    source: {
      cell: source,
      port: `${source}-out`,
    },
    target: {
      cell: target,
      port: `${target}-in`,
    },
    zIndex: 0,
    data: {
      source,
      target,
    },
  };
  if (graph) {
    graph.addEdge(edge);
  }
};

// 根据节点的类型获取ports
const getPortsByType = (type: NodeType, nodeId: string) => {
  return [
    {
      id: `${nodeId}-in`,
      group: 'in',
    },
    {
      id: `${nodeId}-out`,
      group: 'out',
    },
  ];
};

// auto layout
export function layout(graph: Graph, nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph({ compound: true });
  const dir = 'LR';
  g.setGraph({ rankdir: dir, nodesep: 100, ranksep: 100 });
  g.setDefaultEdgeLabel(() => ({}));

  const width = 180;
  const height = 112;
  nodes.forEach((node) => {
    g.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    const source = edge.getSourceCellId();
    const target = edge.getTargetCellId();
    g.setEdge(source, target);
  });

  dagre.layout(g);

  g.nodes().forEach((id) => {
    const node = graph.getCellById(id) as Node;
    if (node) {
      const pos = g.node(id);
      node.position(pos.x, pos.y);
    }
  });
}

// fit container
export function fitContent(graph: Graph) {
  if (!graph) {
    return;
  }
  const zoomOptions = {
    padding: {
      left: 10,
      right: 10,
    },
  };
  graph.zoomToFit(zoomOptions);
}

// 开启边的运行动画
export const excuteAnimate = (graph: Graph, node?: Node) => {
  stopAnimate(graph);
  const setAnimate = (edge: Edge) => {
    edge.attr('line/strokeDasharray', 5);
    edge.attr('line/style/animation', `${styles['running-line']} 30s infinite linear`);
    edge.attr('line/strokeWidth', 2);
  };
  const influencedNode: Set<Node> = new Set();
  const influencedEdge: Set<Edge> = new Set();
  if (node) {
    const searchFunc = (cell: Cell, direction: 'in' | 'out') => {
      if (direction === 'in') {
        graph.getIncomingEdges(cell)?.forEach((edge) => {
          influencedNode.add(edge.getSourceNode());
          influencedNode.add(edge.getTargetNode());
          influencedEdge.add(edge);
          setAnimate(edge);
        });
      }
      if (direction === 'out') {
        graph.getOutgoingEdges(cell)?.forEach((edge) => {
          influencedNode.add(edge.getSourceNode());
          influencedNode.add(edge.getTargetNode());
          influencedEdge.add(edge);
          setAnimate(edge);
        });
      }
    };
    graph.searchCell(node, (cell) => searchFunc(cell, 'in'), { incoming: true });
    graph.searchCell(node, (cell) => searchFunc(cell, 'out'), { outgoing: true });
  } else {
    graph.getEdges().forEach((edge) => {
      setAnimate(edge);
    });
  }

  graph.getNodes().filter((node) => node.shape === DATA_LINEAGE_DAG_NODE).filter(node => !influencedNode.has(node)).forEach((node) => {
    node.attr('body/opacity', 0.5);
  });

  graph.getEdges().filter(edge => !influencedEdge.has(edge)).forEach((edge) => {
    edge.attr('line/opacity', 0.5);
  });
};

// 关闭边的动画
export const stopAnimate = (graph: Graph) => {
  graph.getNodes().filter((node) => node.shape === DATA_LINEAGE_DAG_NODE).forEach((node) => {
    node.attr('body/opacity', 1);
  });
  graph.getEdges().forEach((edge) => {
    edge.attr('line/strokeDasharray', 0);
    edge.attr('line/style/animation', '');
    edge.attr('line/opacity', 1);
    edge.attr('line/strokeWidth', 1);
  });
};