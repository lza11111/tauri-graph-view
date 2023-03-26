import { appWindow } from '@/lib/tauri';
import { Input } from 'antd';

import styles from './styles.module.scss';

export function Header() {
  const handleMinimizeWindow = async () => {
    appWindow.minimize();
  };
  const handleCloseWindow = async () => {
    appWindow.close();
  };
  const handleMaximizeWindow = async () => {
    appWindow.toggleMaximize();
  };

  return (
    <div className={styles.header}>
      <div className={styles['header-left']}>
        <div className={styles.logo}>
          <span>🐕</span>
        </div>
        <div className={styles.title} data-tauri-drag-region>
          <span data-tauri-drag-region>Data Lineage</span>
        </div>
      </div>
      <div className={styles['header-center']} data-tauri-drag-region>
        <div className={styles.item} data-tauri-drag-region>
          <span data-tauri-drag-region>🔍</span>
          <Input style={{ height: 24 }} />
        </div>
      </div>
      <div className={styles['header-right']}>
        <div className={styles.action} onClick={handleMinimizeWindow}>
          <img
            src="https://api.iconify.design/mdi:window-minimize.svg"
            alt="minimize"
          />
        </div>
        <div className={styles.action} onClick={handleMaximizeWindow}>
          <img
            src="https://api.iconify.design/mdi:window-maximize.svg"
            alt="maximize"
          />
        </div>
        <div className={styles.action} onClick={handleCloseWindow}>
          <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
        </div>
      </div>
    </div>
  );
}