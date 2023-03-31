import React, { useState } from 'react';
import classnames from 'classnames';
import { Modal } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { ReactNodeProps } from './definetion';

import styles from './styles.module.scss';

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
  const attr = node?.getAttrs();
  const { name, platform, type } = data;

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLeftCollapse = () => {
    setLeftCollapsed(!leftCollapsed);
  };

  const handleRightCollapse = () => {
    setRightCollapsed(!rightCollapsed);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  
  return (
    <div className={styles['lineage-node']} style={{ ...attr.body }}>
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
          <div className={styles.item} onClick={showModal}>
            <span>view details</span>
          </div>
        </div>
      </div>
      <div className={styles.ctaLeft} onClick={handleLeftCollapse}>
        {leftCollapsed ? <PlusOutlined /> : <MinusOutlined />}
      </div>
      <div className={styles.ctaRight} onClick={handleRightCollapse}>
        {rightCollapsed ? <PlusOutlined /> : <MinusOutlined />}
      </div>
      
      <Modal title={`View ${name}`} open={isModalOpen} closable onCancel={handleCancel} footer={null}>
        {
          Object.entries(data).map(([key, value]) => (
            <p key={key}>{`${key}: ${value}`}</p>
          ))
        }
      </Modal>
    </div>
  );
}

export function PlatformGroupNode(props: ReactNodeProps) {
  const { node } = props;
  const data = node?.getData();
  const { platform, color } = data;
  const customCSS = {
    '--primary-color': color,
  };
  return (
    <div className={styles['platform-group']} style={customCSS as React.CSSProperties}>
      <div className={styles.header}>
        <span>{platformIconMap[platform]}</span>
        <span className={styles.platform}>{platform}</span>
      </div>
      <div className={styles.body}>

      </div>
    </div>
  );
}