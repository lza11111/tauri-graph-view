import { CompressOutlined, DoubleRightOutlined, FullscreenOutlined, SettingOutlined, SlidersOutlined } from '@ant-design/icons';
import { Graph } from '@antv/x6';
import { layout } from './utils';
import styles from './styles.module.scss';

import { DATA_LINEAGE_DAG_NODE } from './definetion';
import { invoke } from '@tauri-apps/api';

enum ContorlType {
  Action,
  Divider,
}
interface IControl {
  id: string;
  name?: string;
  icon?: JSX.Element;
  type: ContorlType;
  action?: () => void;
}
function Divider() {
  return (
    <div className={styles['control-divider']} />
  );
}

export function Controls(props: { graph: Graph; }) {
  const { graph } = props;
  const contorls: IControl[] = [{
    id: 'expend-icon',
    name: 'Expand',
    icon: <DoubleRightOutlined />,
    type: ContorlType.Action
  }, {
    id: 'divider1',
    type: ContorlType.Divider
  }, {
    id: 'settings',
    name: 'Settings',
    icon: <SettingOutlined />,
    type: ContorlType.Action
  }, {
    id: 'scale-to-fit',
    name: 'Scale to fit',
    icon: <CompressOutlined />,
    type: ContorlType.Action,
    action: () => {
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
  }, {
    id: 're-layout',
    name: 'Re-layout',
    icon: <SlidersOutlined />,
    type: ContorlType.Action,
    action: () => {
      if (!graph) {
        return;
      }
      layout(graph, graph.getNodes().filter((node) => node.shape === DATA_LINEAGE_DAG_NODE), graph.getEdges());
    }
  }, {
    id: 'divider2',
    type: ContorlType.Divider
  }, {
    id: 'fullscreen',
    name: 'Fullscreen',
    icon: <FullscreenOutlined />,
    type: ContorlType.Action,
    action: () => {
      invoke('toggle_fullscreen');
    }
  }];

  return (
    <div className={styles['lineage-control']}>
      <div className={styles.controls}>
        {
          contorls.map((ctl) => (
            ctl.type === ContorlType.Action ? (
              <div key={ctl.id} className={styles['control-item']} onClick={ctl.action}>
                {ctl.icon}
              </div>
            ) : <Divider key={ctl.id}/>
          ))
        }
      </div>
    </div>
  );
}