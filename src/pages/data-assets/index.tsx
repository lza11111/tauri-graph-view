import { useEffect, useState } from 'react';
import { invoke } from '@/lib/tauri';
import classnames from 'classnames';
import dynamic from 'next/dynamic';
import { listen } from '@tauri-apps/api/event';
import { Button, Dropdown, Modal, Space, Tabs, Tooltip } from "antd";
import type { TabsProps } from 'antd';
import { ArrowLeftOutlined, ConsoleSqlOutlined, DatabaseOutlined, EllipsisOutlined, ShareAltOutlined, TableOutlined, WarningOutlined } from "@ant-design/icons";
import { Layout, Header } from "@/components/Layout";
import DataAssets from '@/assets/icon/data-assets.svg';
import CosmosIcon from '@/assets/azure-icons/10121-icon-service-Azure-Cosmos-DB.svg';

import sampleData from '@/assets/simple-data.json';
import styles from './styles.module.scss';

const DataLineageGraph = dynamic(() => import('@/components/Graph'), { ssr: false });

export default function DataAssetsHome() {
  const [data, setData] = useState<any[]>(sampleData);
  useEffect(() => {
    const { open } = require('@tauri-apps/api/dialog');
    const { appConfigDir } = require('@tauri-apps/api/path');
    const unlisten = listen('load_file', async () => {
      const selected = await open({
        filters: [{
          name: 'Json',
          extensions: ['json']
        }],
        defaultPath: await appConfigDir(),
      });
      if (selected) {
        const content: string = await invoke('read_file', { filePath: selected });
        setData(JSON.parse(content));
      }
    });
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const onLoadFile = async () => {
    if (typeof window === 'undefined') return;
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: "JSON Files",
            accept: {
              "application/json": [".json"],
            },
          },
        ],
      });
      const file = await fileHandle.getFile();
      const contents = await file.text();
      if (contents) {
        setData(JSON.parse(contents));
      }
    } catch (e) {
      Modal.error({
        title: 'Error',
        content: e.message,
      });
    }
  };
  const items: TabsProps['items'] = [
    {
      key: 'overview',
      label: `Overview`,
      children: `Content of Tab Pane 1`,
    },
    {
      key: 'columns',
      label: `Columns`,
      children: `Content of Tab Pane 2`,
    },
    {
      key: 'lineage',
      label: `Lineage`,
      children: <DataLineageGraph data={data} onLoadFile={onLoadFile} />,
    },
  ];

  return (
    <Layout>
      <Header icon={<img src={DataAssets.src} style={{ height: '1.25rem' }} />} title="Assets" />
      <main className={styles.main}>
        <div className={styles['header-container']}>
          <Button className={styles.return}><ArrowLeftOutlined /></Button>
          <div className={styles.header}>
            <div className={styles.description}>
              <div className={styles.title}>
                INSTACART_BEVERAGES_ORDER_CUSTOMER
              </div>
              <div className={styles.metadata}>
                <div className={styles['metadata-item']}>
                  <img src={CosmosIcon.src} />
                  <span className={styles.text}>cosmos</span>
                </div>
                <div className={styles['metadata-item']}>
                  <span><DatabaseOutlined /></span>
                  <span className={classnames(styles.text, styles.underline)}>SOME_DATABASE</span>
                </div>
                <div className={styles['metadata-item']}>
                  <span><TableOutlined /></span>
                  <span className={classnames(styles.text, styles.underline)}>SOME_TABLE</span>
                </div>
              </div>
            </div>
          </div>
          <Space.Compact className={styles.actions}>
            <Tooltip title="Query">
              <Button icon={<ConsoleSqlOutlined />} >Query</Button>
            </Tooltip>
            <Tooltip title="Share">
              <Button icon={<ShareAltOutlined />} />
            </Tooltip>
            <Button icon={<img
              src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20221209.001/assets/brand-icons/product/svg/teams_48x1.svg"
              width={20}
              style={{ marginLeft: 5 }}
              alt="Microsoft Teams product icon" />}
            />
            <Dropdown
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: '1',
                    label: 'Report',
                    icon: <WarningOutlined />,
                  }]
              }}
              trigger={['click']}
            >
              <Button icon={<EllipsisOutlined />} />
            </Dropdown>
          </Space.Compact>
        </div>
        <Tabs className={styles['profile-tab']} activeKey='lineage' items={items} />
      </main>
    </Layout>
  );
}