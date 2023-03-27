import dynamic from 'next/dynamic';
import { Button, Tabs } from "antd";
import type { TabsProps } from 'antd';
import { ArrowLeftOutlined } from "@ant-design/icons";
import classnames from 'classnames';
import { Layout, Header } from "@/components/Layout";
import DataAssets from '@/assets/icon/data-assets.svg';

import styles from './styles.module.scss';

const DataLineageGraph = dynamic(() => import('@/components/Graph'), { ssr: false });

export default function DataAssetsHome() {

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
      children: <DataLineageGraph />,
    },
  ]

  return (
    <Layout>
      <Header icon={<img src={DataAssets.src} style={{ height: '1.25rem' }} />} title="Assets" />
      <main className={styles.main}>
        <div className={styles['header-container']}>
          <Button><ArrowLeftOutlined /></Button>
          <div className={styles.header}>
            <div className={styles.description}>
              <div className={styles.title}>
                INSTACART_BEVERAGES_ORDER_CUSTOMER
              </div>
              <div className={styles.metadata}>
                <div className={styles['metadata-item']}>
                  <span>🌌</span>
                  <span className={styles.text}>cosmos</span>
                </div>
                <div className={styles['metadata-item']}>
                  <span>🌌</span>
                  <span className={classnames(styles.text, styles.underline)}>cosmos</span>
                </div>
                <div className={styles['metadata-item']}>
                  <span>🌌</span>
                  <span className={classnames(styles.text, styles.underline)}>cosmos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Tabs className={styles['profile-tab']} activeKey='lineage' items={items}/>
      </main>
    </Layout>
  )
}