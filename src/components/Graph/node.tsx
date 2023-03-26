import React from 'react';
import classnames from 'classnames';

import styles from './styles.module.scss';
import { ReactNodeProps } from './definetion';

const platformIconMap = {
  "Geneva": '📚',
  "Kusto": '📊',
  "Cosmos": '🌌',
  "Lens": '🖨',
  "ADF": '🏭',
};

export function DataLineageNode(props: ReactNodeProps) {
  const { node } = props;
  const data = node?.getData();
  const { name, platform, type } = data;

  return (
    <div className={styles['lineage-node']}>
      <div className={styles.content}>
        <div className={styles['node-text']}>
          <span className={styles.truncate} title={name}>{name}</span>
          {/* <span>🐕</span> */}
        </div>
        <div className={styles['node-meta']}>
          <span className={styles.platform}>{platformIconMap[platform]}</span>
          <span className={classnames(styles.type, styles.text)}>{type}</span>
        </div>
      </div>
      <div className={styles.ports}>
        <div className={styles.actions}>
          <div className={styles.item}>
            <span>view details</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlatformGroupNode(props: ReactNodeProps) {
  const { node } = props;
  const data = node?.getData();
  const { platform } = data;

  return (
    <div className={styles['platform-group']}>
      <div className={styles.header}>
        <span>{platformIconMap[platform]}</span>
        <span className={styles.platform}>{platform}</span>
      </div>
      <div className={styles.body}>

      </div>
    </div>
  );
}