import {
  InfoCircleFilled,
  QuestionCircleFilled,
} from '@ant-design/icons';
import {
  ProConfigProvider,
  ProLayout,
} from '@ant-design/pro-components';
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
          logo={<img src={microsoftLogo.src} />}
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
          menuItemRender={(item) => (
            <div
              onClick={() => {
                if (item.path === 'data-assets') {
                  setPathname(item.path || '/welcome');
                  Router.push(item.path);
                }
              }}
            >
              <MenuItem {...item}/>
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
  );
}