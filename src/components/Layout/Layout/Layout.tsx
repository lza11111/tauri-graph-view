import {
  CaretDownFilled,
  DoubleRightOutlined,
  GithubFilled,
  InfoCircleFilled,
  LogoutOutlined,
  PlusCircleFilled,
  QuestionCircleFilled,
  SearchOutlined,
} from '@ant-design/icons';
import type { ProSettings } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProConfigProvider,
  ProLayout,
  SettingDrawer,
} from '@ant-design/pro-components';
import { Button, Divider, Input, Dropdown, Popover, theme } from 'antd';
import Router from 'next/router';
import React, { useState } from 'react';
import MenuItem from './Menu/MenuItem';
import defaultProps from './_defaultProps';

import microsoftLogo from '@/assets/microsoft.png';
import styles from './styles.module.scss';

export function Layout(props: React.PropsWithChildren) {
  const { children } = props;
  const [pathname, setPathname] = useState('/data-assets');
  return (
    <div
      id="pro-layout"
      style={{
        height: '100vh',
      }}
    >
      <ProConfigProvider hashed={false}>
        <ProLayout
          {...defaultProps}
          className={styles.layout}
          logo={microsoftLogo.src}
          title={false}
          collapsed={false}
          location={{
            pathname,
          }}
          siderWidth={130}
          siderMenuType="group"
          contentStyle={{ padding: 0, height: '100%' }}
          menu={{
            type: 'sub',
            collapsedShowTitle: true,
          }}
          actionsRender={(props) => {
            if (props.isMobile) return [];
            return [
              <InfoCircleFilled key="InfoCircleFilled" />,
              <QuestionCircleFilled key="QuestionCircleFilled" />,
            ];
          }}
          menuItemRender={(item, dom) => (
            <div
              onClick={() => {
                if (item.path === 'data-assets') {
                  setPathname(item.path || '/welcome');
                  Router.push(item.path);
                }
              }}
            >
              <MenuItem {...item}/>
              {/* {dom} */}
            </div>
          )}
          collapsedButtonRender={false}
          menuProps={{
            _internalDisableMenuItemTitleTooltip: true,
          }}
        >
          {children}
        </ProLayout>
      </ProConfigProvider>
    </div>
  )
}