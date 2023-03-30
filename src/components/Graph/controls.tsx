import { DoubleRightOutlined } from '@ant-design/icons';
import { Graph } from '@antv/x6';
import classnames from 'classnames';
import { MouseEvent } from 'react';
import styles from './styles.module.scss';

export enum ControlType {
  Action,
  Divider,
}

export interface IControl {
  id: string;
  name?: string;
  component?: JSX.Element;
  /**  If no component, will show icon and apply action. */
  icon?: JSX.Element;
  /**  If no component, will show icon and apply action. */
  action?: () => void;
  type: ControlType;
  show?: boolean | (() => boolean);
}

function Divider() {
  return (
    <div className={styles['control-divider']} />
  );
}

interface IControlsProps {
  graph: Graph;
  position: 'top-right' | 'bottom-right' | 'top-left';
  showCollapseButton?: boolean;
  controls: IControl[];
}

interface IControlItemProps {
  children?: React.ReactNode;
  onClick?: (e?: MouseEvent) => void;
}

export function ControlsItem(props: IControlItemProps) {
  const { children, onClick } = props;
  return (
    <div className={styles['control-item']} onClick={onClick}>
      {children}
    </div>
  );
}

export function Controls(props: IControlsProps) {
  const { showCollapseButton = false, position, controls } = props;

  const renderControls = (controls: IControl[]) => controls.map((ctl) => (
    (typeof ctl.show === 'undefined' || typeof ctl.show === 'boolean' && ctl.show === true || typeof ctl.show === 'function' && ctl.show()) 
    && ctl.type === ControlType.Action ? ctl.component ? ctl.component : (
        <div key={ctl.id} className={styles['control-item']} onClick={ctl.action}>
          {ctl.icon}
        </div>
      ) : <Divider key={ctl.id} />
  ));

  const collapseButtonGroup: IControl[] = [
    {
      id: 'expend-icon',
      name: 'Expand',
      icon: <DoubleRightOutlined />,
      type: ControlType.Action
    }, {
      id: 'divider1',
      type: ControlType.Divider
    }
  ];

  return (
    <div className={classnames(styles['lineage-control'], styles[position])}>
      <div className={styles.controls}>
        {showCollapseButton ? renderControls(collapseButtonGroup) : null}
        {renderControls(controls)}
      </div>
    </div>
  );
}