import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Graph, Node, Edge, Platform, Cell } from '@antv/x6';
import { Selection } from '@antv/x6-plugin-selection';
import { invoke } from '@tauri-apps/api';
import { SettingOutlined, CompressOutlined, SlidersOutlined, FullscreenOutlined, SearchOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { DATA_LINEAGE_DAG_NODE, embedPadding, NodeType } from './definetion';
import { createEdge, createGroup, createNode, fitContent, layout } from './utils';
import styles from './styles.module.scss';
import { Controls, ControlsItem, ControlType, IControl } from './controls';
import { Button, Input, InputRef, RefSelectProps, Select } from 'antd';


require('./register');

// 开启边的运行动画
const excuteAnimate = (graph: Graph, node?: Node) => {
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
const stopAnimate = (graph: Graph) => {
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

interface ISearchComponentProps<T> {
  options?: T[];
  graph: Graph;
}

function SearchComponent<T>(props: ISearchComponentProps<T>) {
  const { options, graph } = props;
  const [isSearching, setSearchState] = useState(false);
  const inputRef = useRef<InputRef>();
  const [filterOptions, setFilterOptions] = useState<Record<string, string>>({});
  const [filterField, setFilterField] = useState<string>();
  const [filterValue, setFilterValue] = useState<string>();

  useEffect(() => {
    if (isSearching) {
      inputRef.current.focus();
    }
  }, [isSearching]);

  useEffect(() => {
    options && setFilterField(Object.keys(options[0])[0]);
  }, [options]);

  useEffect(() => {
    if(Object.keys(filterOptions).length > 0){
      graph.select(Object.entries(filterOptions).reduce<Node[]>((prev, curr) => {
        return prev.filter((node) => node.getData()[curr[0]].toString().toLowerCase().indexOf(curr[1].toLowerCase()) !== -1)
      }, graph.getNodes().filter((node) => node.shape === DATA_LINEAGE_DAG_NODE)));
    }
  }, [filterOptions]);

  const selectBefore = useMemo(() => (
    options && (
      <Select dropdownMatchSelectWidth={false} value={filterField} onChange={setFilterField}>
        {Object.keys(options[0]).map((key) => (
          <Select.Option key={key} value={key}>{key}</Select.Option>
        ))}
      </Select>
    )
  ), [options, filterField]);
  return (
    <ControlsItem onClick={() => !isSearching ? setSearchState(true) : null}>
      {
        !isSearching ? <SearchOutlined /> : (
          <div className={styles['search-body']}>
            <div className={styles['search-input']}>
              <SearchOutlined onClick={() => setSearchState(false)} />
              <Input ref={inputRef} addonBefore={selectBefore} onChange={(e) => setFilterValue(e.target.value)} />
              <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => {
                setFilterOptions({
                  ...filterOptions,
                  [filterField]: filterValue,
                })
              }} />
            </div>
            <div className={styles['search-params']}>
              {
                Object.entries(filterOptions).map(([key, value]) => (
                  <div key={key}>
                    <span>{key}</span>
                    <span>:</span>
                    <span>{value}</span>
                    <DeleteOutlined onClick={() => delete filterOptions[key] && setFilterOptions({
                      ...filterOptions,
                    })} />
                  </div>
                ))
              }
            </div>
            {/* <Select
              className={styles.select}
              ref={inputRef}
              onBlur={() => setSearchState(false)}
              onChange={(value) => {
                excuteAnimate(graph, graph.getCellById(value) as Node);
                graph.select(value);
              }}
              showArrow={false}
              notFoundContent={null}
              showSearch
              options={options} /> */}


          </div>
        )
      }
    </ControlsItem>

  );
}

interface IDataLineageGraphProps {
  data: any[];
}

export default function DataLineageGraph(props: IDataLineageGraphProps) {
  const { data } = props;
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

  const topRightControls: IControl[] = [{
    id: 'search',
    name: 'Serach',
    component: <SearchComponent graph={graphIns} options={graphIns?.getNodes().filter((node) => node.shape === DATA_LINEAGE_DAG_NODE).map((node) => node.getData())} />,
    type: ControlType.Action
  }];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div id='container' style={{ width: '100%', height: '100%' }} />
      <Controls controls={bottomRightControls} showCollapseButton graph={graphIns} position='bottom-right' />
      <Controls controls={topRightControls} graph={graphIns} position='top-left' />
    </div>
  );
}