import { appWindow } from '@/lib/tauri';
import { Input } from 'antd';

import styles from './styles.module.scss';

interface IHeaderProps {
  icon: React.ReactNode;
  title: string;
}

export function Header(props: IHeaderProps) {
  const { icon, title } = props;
  return (
    <header className={styles.header}>
      <div className={styles['header-content']}>
        <span className={styles['icon']}>{icon}</span>
        <span className={styles['title']}>{title}</span>
      </div>
    </header>
  );
}