import React, { useEffect, useState } from 'react';
import { Graph, Node, Edge, Platform, Cell } from '@antv/x6';
import { Selection } from '@antv/x6-plugin-selection';
import { DATA_LINEAGE_DAG_NODE, embedPadding, NodeType } from './definetion';
import { createEdge, createGroup, createNode, layout } from './utils';
import data from './simple-data.json';
import styles from './styles.module.scss';
import { Controls } from './controls';

require('./register');

// 开启边的运行动画
const excuteAnimate = (graph: Graph, node?: Node) => {
  stopAnimate(graph);
  const setAnimate = (edge: Edge) => {
    edge.attr('line/strokeDasharray', 5);
    edge.attr('line/style/animation', `${styles['running-line']} 30s infinite linear`);
  };
  if (node) {
    const searchFunc = (cell: Cell, direction: 'in' | 'out') => {
      if (direction === 'in') {
        graph.getIncomingEdges(cell)?.forEach((edge) => {
          setAnimate(edge);
        });
      }
      if (direction === 'out') {
        graph.getOutgoingEdges(cell)?.forEach((edge) => {
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

};

// 关闭边的动画
const stopAnimate = (graph: Graph) => {
  graph.getEdges().forEach((edge) => {
    edge.attr('line/strokeDasharray', 0);
    edge.attr('line/style/animation', '');
  });
};

export default function DataLineageGraph() {
  const [graphIns, setGraphIns] = useState<Graph>();

  useEffect(() => {
    const graph: Graph = new Graph({
      container: document.getElementById('container')!,
      autoResize: true,
      panning: {
        enabled: true,
        eventTypes: ['leftMouseDown'],
      },
      mousewheel: {
        enabled: true,
        modifiers: null,
        zoomAtMousePosition: true,
        factor: 1.1,
        maxScale: 1.5,
        minScale: 0.5,
      },
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#fff',
              stroke: '#31d0c6',
              strokeWidth: 4,
            },
          },
        },
      },
      connecting: {
        snap: true,
        allowBlank: false,
        allowLoop: false,
        highlight: true,
        sourceAnchor: {
          name: 'left',
          args: {
            dx: Platform.IS_SAFARI ? 4 : 8,
          },
        },
        targetAnchor: {
          name: 'right',
          args: {
            dx: Platform.IS_SAFARI ? 4 : -8,
          },
        },
        createEdge() {
          return graph.createEdge({
            shape: 'data-processing-curve',
            attrs: {
              line: {
                strokeDasharray: '5 5',
              },
            },
            zIndex: 0,
          });
        },
      },
    });
    graph.on('node:click', ({ node }) => {
      excuteAnimate(graph, node);
    });
    graph.on('blank:click', () => {
      stopAnimate(graph);
    });
    graph.on('node:change:size', ({ node, options }) => {
      if (options.skipParentHandler) {
        return;
      }

      const children = node.getChildren();
      if (children && children.length) {
        node.prop('originSize', node.getSize());
      }
    });
    graph.on('node:change:children', ({ node }) => {
      let x = Number.POSITIVE_INFINITY, y = Number.POSITIVE_INFINITY, cornerX = Number.NEGATIVE_INFINITY, cornerY = Number.NEGATIVE_INFINITY;
      let hasChange = false;

      const children = node.getChildren();
      if (children) {
        children.forEach((child) => {
          const bbox = child.getBBox().inflate(embedPadding, 2 * embedPadding);
          const corner = bbox.getCorner();

          if (bbox.x < x) {
            x = bbox.x;
            hasChange = true;
          }

          if (bbox.y < y) {
            y = bbox.y;
            hasChange = true;
          }

          if (corner.x > cornerX) {
            cornerX = corner.x;
            hasChange = true;
          }

          if (corner.y > cornerY) {
            cornerY = corner.y;
            hasChange = true;
          }
        });
      }

      if (hasChange) {
        node.prop(
          {
            position: { x, y },
            size: { width: cornerX - x, height: cornerY - y },
          },
          { skipParentHandler: true },
        );
      }
    });
    graph.on('node:change:position', ({ node, options }) => {
      if (options.skipParentHandler) {
        return;
      }

      const children = node.getChildren();
      if (children && children.length) {
        node.prop('originPosition', node.getPosition());
      }

      const parent = node.getParent();
      if (parent && parent.isNode()) {
        let originSize = parent.prop('originSize');
        if (originSize == null) {
          originSize = parent.getSize();
          parent.prop('originSize', originSize);
        }

        let originPosition = parent.prop('originPosition');
        if (originPosition == null) {
          originPosition = parent.getPosition();
          parent.prop('originPosition', originPosition);
        }

        let x = Number.POSITIVE_INFINITY, y = Number.POSITIVE_INFINITY, cornerX = Number.NEGATIVE_INFINITY, cornerY = Number.NEGATIVE_INFINITY;
        let hasChange = false;

        const children = parent.getChildren();
        if (children) {
          children.forEach((child) => {
            const bbox = child.getBBox().inflate(embedPadding, 2 * embedPadding);
            const corner = bbox.getCorner();

            if (bbox.x < x) {
              x = bbox.x;
              hasChange = true;
            }

            if (bbox.y < y) {
              y = bbox.y;
              hasChange = true;
            }

            if (corner.x > cornerX) {
              cornerX = corner.x;
              hasChange = true;
            }

            if (corner.y > cornerY) {
              cornerY = corner.y;
              hasChange = true;
            }
          });
        }

        if (hasChange) {
          parent.prop(
            {
              position: { x, y },
              size: { width: cornerX - x, height: cornerY - y },
            },
            { skipParentHandler: true },
          );
        }
      }
    });
    graph.use(
      new Selection({
        enabled: true,
        multiple: true,
        rubberEdge: true,
        rubberNode: true,
        modifiers: 'shift',
        rubberband: true,
      }),
    );
    data.forEach(element => {
      const node = createNode(NodeType.DATA, graph, element);

      if (element.inputIdList?.length) {
        element.inputIdList.forEach((source) => {
          createEdge(source, element.id ?? element.name, graph);
        });
      }

      if (element.outputIdList?.length) {
        element.outputIdList.forEach((target) => {
          createEdge(element.id ?? element.name, target, graph);
        });
      }
      let parent = graph.getCellById(element.platform);
      if (!parent) {
        parent = createGroup(graph, element.platform);
      }
      parent.addChild(node);
    });
    layout(graph, graph.getNodes().filter((node) => node.shape === DATA_LINEAGE_DAG_NODE), graph.getEdges());

    setGraphIns(graph);

    return () => {
      graph.dispose();
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div id='container' style={{ width: '100%', height: '100%' }} />
      <Controls graph={graphIns} />
    </div>
  );
}