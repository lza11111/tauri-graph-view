import { Graph, Path, Edge } from '@antv/x6';
import { register } from '@antv/x6-react-shape';
import { DATA_LINEAGE_DAG_NODE, PLATFORM_GROUP_NODE } from './definetion';
import { DataLineageNode, PlatformGroupNode } from './node';

register({
  shape: DATA_LINEAGE_DAG_NODE,
  width: 180,
  height: 112,
  component: DataLineageNode,
  ports: {
    groups: {
      in: {
        position: {
          name: 'left',
          args: {
            dy: -20,
          }
        },
        attrs: {
          circle: {
            r: 4,
            magnet: false,
            stroke: 'transparent',
            strokeWidth: 1,
            fill: 'transparent',
          },
        },
      },

      out: {
        position: {
          name: 'right',
          args: {
            dy: -20,
          },
        },

        attrs: {
          circle: {
            r: 4,
            magnet: false,
            stroke: 'transparent',
            strokeWidth: 1,
            fill: 'transparent',
          },
        },
      },
    },
  },
});

register({
  shape: PLATFORM_GROUP_NODE,
  component: PlatformGroupNode,
});

// 注册连线
Graph.registerConnector(
  'curveConnector',
  (sourcePoint, targetPoint) => {
    const hgap = Math.abs(targetPoint.x - sourcePoint.x);
    const path = new Path();
    path.appendSegment(
      Path.createSegment('M', sourcePoint.x - 4, sourcePoint.y),
    );
    path.appendSegment(
      Path.createSegment('L', sourcePoint.x + 12, sourcePoint.y),
    );
    // 水平三阶贝塞尔曲线
    path.appendSegment(
      Path.createSegment(
        'C',
        sourcePoint.x < targetPoint.x
          ? sourcePoint.x + hgap / 2
          : sourcePoint.x - hgap / 2,
        sourcePoint.y,
        sourcePoint.x < targetPoint.x
          ? targetPoint.x - hgap / 2
          : targetPoint.x + hgap / 2,
        targetPoint.y,
        targetPoint.x - 6,
        targetPoint.y,
      ),
    );
    path.appendSegment(
      Path.createSegment('L', targetPoint.x + 2, targetPoint.y),
    );

    return path.serialize();
  },
  true,
);

Edge.config({
  markup: [
    {
      tagName: 'path',
      selector: 'wrap',
      attrs: {
        fill: 'none',
        cursor: 'pointer',
        stroke: 'transparent',
        strokeLinecap: 'round',
      },
    },
    {
      tagName: 'path',
      selector: 'line',
      attrs: {
        fill: 'none',
        pointerEvents: 'none',
      },
    },
  ],
  connector: { name: 'curveConnector' },
  attrs: {
    wrap: {
      connection: true,
      strokeWidth: 10,
      strokeLinejoin: 'round',
    },
    line: {
      connection: true,
      stroke: '#3471F9',
      strokeWidth: 1,
      targetMarker: {
        name: 'classic',
        size: 6,
      },
    },
  },
});

Graph.registerEdge('data-processing-curve', Edge, true);
