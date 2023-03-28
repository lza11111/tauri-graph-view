import type { MenuDataItem } from '@ant-design/pro-components';
import styles from './styles.module.scss';

export default function MenuItem(props: MenuDataItem){
  const { name, icon } = props;
  return (
    <div className={styles['menu-item']}>
      <span className={styles.icon}>
        {icon}
      </span>
      <span className={styles.text}>
        {name}
      </span>
    </div>
  );
}