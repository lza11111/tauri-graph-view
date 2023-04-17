import React, { useEffect, useState } from 'react';
import { Graph, Node } from '@antv/x6';
import { Selection } from '@antv/x6-plugin-selection';
import { invoke } from '@tauri-apps/api';
import { SettingOutlined, CompressOutlined, SlidersOutlined, FullscreenOutlined, FileOutlined } from '@ant-design/icons';
import { DATA_LINEAGE_DAG_NODE, embedPadding, NodeType } from './definetion';
import { createEdge, createGroup, createNode, excuteAnimate, fitContent, layout, stopAnimate } from './utils';
import { Controls, ControlType, IControl } from './controls';
import { SearchComponent } from './search';

require('./register');

interface IDataLineageGraphProps {
  data: any[];
  onLoadFile: () => void;
}

export default function DataLineageGraph(props: IDataLineageGraphProps) {
  const { data, onLoadFile } = props;
  const [graphIns, setGraphIns] = useState<Graph>();

  useEffect(() => {
    const graph: Graph = new Graph({
      container: document.getElementById('container')!,
      autoResize: true,
      panning: {
        enabled: true,
        eventTypes: ['leftMouseDown'],
      },
      background: {
        color: '#eee'
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
    });
    graph.on('node:click', ({ node }) => {
      if (node.shape === DATA_LINEAGE_DAG_NODE) {
        excuteAnimate(graph, node);
      }
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
    graph.on('node:change:visible', ({ node, options }) => {
      const direction = options.direction;
      graph.getNodes().forEach((node) => {
        if (node.getChildren()?.length > 0) {
          if (node.getChildren().every((node) => node.visible === false)) {
            node.hide();
          } else {
            node.show();
          }
        }
      });
      if (direction === 'left') {
        if (node.visible === false) {
          graph.getEdges().filter((edge) => {
            return edge.getTargetCell() === node;
          }).forEach((edge) => edge.hide({ direction: 'left' }));
        } else {
          graph.getEdges().filter((edge) => {
            return edge.getTargetCell() === node;
          }).forEach((edge) => edge.show({ direction: 'left' }));
        }
      }
      if (direction === 'right') {
        if (node.visible === false) {
          graph.getEdges().filter((edge) => {
            return edge.getSourceCell() === node;
          }).forEach((edge) => edge.hide({ direction: 'right' }));
        } else {
          graph.getEdges().filter((edge) => {
            return edge.getSourceCell() === node;
          }).forEach((edge) => {
            console.log(edge.getSourceCellId(), edge.getTargetCellId());
            edge.show({ direction: 'right' });
          });
        }
      }
    });
    graph.on('edge:change:visible', ({ edge, options }) => {
      const direction = options.direction;
      if (direction === 'left') {
        const node = edge.getSourceCell();
        if (edge.visible === false) {
          const allHide = graph.getEdges().filter((edge) => {
            return edge.getSourceCell() === node;
          }).every((edge) => edge.visible === false);
          if (allHide) {
            node.hide({ direction: 'left' });
          }
        } else {
          node.show({ direction: 'left' });
        }
      }
      if (direction === 'right') {
        const node = edge.getTargetCell();
        if (edge.visible === false) {
          const allHide = graph.getEdges().filter((edge) => {
            return edge.getTargetCell() === node;
          }).every((edge) => edge.visible === false);
          if (allHide) {
            node.hide({ direction: 'right' });
          }
        } else {
          node.show({ direction: 'right' });
        }
      }
    });
    graph.on('node:change:left-collapse', ({ node }: { node: Node<Node.Properties> }) => {
      const value = node.prop('left-collapse');
      // get node's left edge
      graph.getEdges().filter((edge) => {
        return edge.getTargetCell() === node;
      }).forEach((edge) => {
        // set edge's visible
        if (value) {
          edge.hide({ direction: 'left' });
        } else {
          edge.show({ direction: 'left' });
        }
      });
    });
    graph.on('node:change:right-collapse', ({ node }) => {
      const value = node.prop('right-collapse');
      graph.getEdges().filter((edge) => {
        return edge.getSourceCell() === node;
      }).forEach((edge) => {
        // set edge's visible
        if (value) {
          edge.hide({ direction: 'right' });
        } else {
          edge.show({ direction: 'right' });
        }
      });
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
      createNode(NodeType.DATA, graph, element);

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
    });
    layout(graph, graph.getNodes().filter((node) => node.shape === DATA_LINEAGE_DAG_NODE), graph.getEdges());

    Object.values(graph.getNodes().reduce<Record<number, Node[]>>((map, node) => {
      if (!map[node.getPosition().x]) {
        map[node.getPosition().x] = [];
      }
      map[node.getPosition().x].push(node);
      return map;
    }, {})).forEach((nodes) => {
      nodes.sort((a, b) => a.getPosition().y - b.getPosition().y);
      nodes.forEach((node, idx, arr) => {
        const nodeData = node.getData();
        let parent: Node;
        if (idx === 0 || arr[idx - 1].getData().platform != nodeData.platform) {
          parent = createGroup(graph, nodeData.platform, [nodeData.platform,node.getPosition().x,node.getPosition().y].join('-'));
        } else {
          parent = arr[idx - 1].getParent();
        }
        
        parent.addChild(node);
      });
    });

    setGraphIns(graph);
    fitContent(graph);
    return () => {
      graph.dispose();
    };
  }, [data]);

  const bottomRightControls: IControl[] = [{
    id: 'settings',
    name: 'Settings',
    icon: <SettingOutlined />,
    type: ControlType.Action
  }, {
    id: 'scale-to-fit',
    name: 'Scale to fit',
    icon: <CompressOutlined />,
    action: () => {
      if (!graphIns) {
        return;
      }
      fitContent(graphIns);
    },
    type: ControlType.Action,
  }, {
    id: 're-layout',
    name: 'Re-layout',
    icon: <SlidersOutlined />,
    action: () => {
      if (!graphIns) {
        return;
      }
      layout(graphIns, graphIns.getNodes().filter((node) => node.shape === DATA_LINEAGE_DAG_NODE), graphIns.getEdges());
    },
    type: ControlType.Action,
  }, {
    id: 'divider2',
    type: ControlType.Divider
  }, {
    id: 'fullscreen',
    name: 'Fullscreen',
    icon: <FullscreenOutlined />,
    action: () => {
      invoke('toggle_fullscreen');
    },
    type: ControlType.Action,
  }];

  const topLeftControls: IControl[] = [{
    id: 'search',
    name: 'Serach',
    component: <SearchComponent graph={graphIns} options={graphIns?.getNodes().filter((node) => node.shape === DATA_LINEAGE_DAG_NODE).map((node) => node.getData())} />,
    type: ControlType.Action
  }];

  const topRightControls: IControl[] = [{
    id: 'load-file',
    name: 'Load file',
    icon: <FileOutlined />,
    type: ControlType.Action,
    show: () => !window.__TAURI_IPC__,
    action: () => {
      onLoadFile();
    }
  }];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div id='container' style={{ width: '100%', height: '100%' }} />
      <Controls controls={bottomRightControls} showCollapseButton graph={graphIns} position='bottom-right' />
      <Controls controls={topLeftControls} graph={graphIns} position='top-left' />
      <Controls controls={topRightControls} graph={graphIns} position='top-right' />
    </div>
  );
}