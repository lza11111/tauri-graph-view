import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { Node, Graph } from "@antv/x6";
import { Space, Row, Col, Input, Button, Tabs, Popover, Tag } from "antd";
import { useState, useEffect, useMemo, MouseEvent } from "react";
import { ControlsItem } from "./controls";
import { DATA_LINEAGE_DAG_NODE } from "./definetion";
import styles from './styles.module.scss';

interface ISearchComponentProps<T> {
  options?: T[];
  graph: Graph;
}

export function SearchComponent<T>(props: ISearchComponentProps<T>) {
  const { options, graph } = props;
  const [visible, setVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<Record<string, string>>({});
  const [searchName, setSearchName] = useState<string>('');

  useEffect(() => {
    if(graph) {
      graph.getNodes().filter((node) => node.shape === DATA_LINEAGE_DAG_NODE).forEach((node) => {
        node.attr("body/border", "");
      });
      if (Object.values(filterOptions).length && Object.values(filterOptions).every(str => str.length > 0)) {
        Object.entries(filterOptions).reduce<Node[]>((prev, curr) => {
          return prev.filter((node) => node.getData()[curr[0]]?.toString().toLowerCase().indexOf(curr[1].toLowerCase()) !== -1);
        }, graph.getNodes().filter((node) => node.shape === DATA_LINEAGE_DAG_NODE)).forEach((node) => {
          node.attr("body/border", "2px solid red");
        });
      }
    }
    
    
  }, [filterOptions]);

  const popoverContent = useMemo(() => (
    <Space direction='vertical'>
      {Object.entries(filterOptions).length ? (
        <Space direction='vertical'>
          {
            Object.entries(filterOptions).map(([key, value]) => (
              <Row key={key} align='middle' gutter={4}>
                <Col span={10}>
                  <Space>
                    <span>✔</span>
                    <span style={{ fontWeight: 600 }}>{key}</span>
                  </Space>
                </Col>
                <Col span={12}>
                  <Input value={value} onChange={(e) => setFilterOptions({
                    ...filterOptions,
                    [key]: e.target.value
                  })} />
                </Col>
                <Col span={2}>
                  <Button
                    type='ghost'
                    size='small'
                    icon={<DeleteOutlined />}
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
                      delete filterOptions[key];
                      setFilterOptions({
                        ...filterOptions
                      });
                    }} />
                </Col>
              </Row>
            ))
          }
          <Row justify="end">
            <Col>
              <Button size='small' onClick={() => setFilterOptions({})}>Reset</Button>
            </Col>
          </Row>
        </Space>
      ) : null}
      <Tabs
        activeKey='properties'
        items={[{
          key: 'properties',
          label: 'Properties',
          children: (
            <div className={styles['search-option-container']}>
              <Input prefix={<SearchOutlined />} placeholder='Search properties' onChange={(e) => setSearchName(e.target.value)} />
              {
                options && (
                  Object.keys(options[0]).filter((str) => !Object.keys(filterOptions).includes(str)).filter((str) => str.toLowerCase().indexOf(searchName.toLowerCase()) !== -1).map((key) => (
                    <div key={key} className={styles['search-option-item']} onClick={(e) => {
                      e.stopPropagation();
                      setFilterOptions({
                        ...filterOptions,
                        [key]: '',
                      });
                    }}>
                      <span>⚙</span>
                      <span>{key}</span>
                    </div>
                  ))
                )
              }
            </div>
          )
        }]}
        size="small" />
    </Space>

  ), [options, searchName, filterOptions]);
  return (
    <Popover content={popoverContent} placement="bottomLeft" trigger={['click']} arrow={false} onOpenChange={(visible) => setVisible(visible)}>
      <ControlsItem>
        <Space>
          <SearchOutlined />
          <Space size={0}>
            {
              !visible ? Object.entries(filterOptions).map(([key, value]) => (
                <Tag key={key} style={{ userSelect: 'none' }} onClick={(e) => e.stopPropagation()}>
                  <span>{key}</span>
                  <span>:</span>
                  <span>{value}</span>
                </Tag>
              )) : null
            }
          </Space>
        </Space>
      </ControlsItem>
    </Popover>

  );
}