import styles from './styles.module.scss'
export const Table = () => {
  return (
    <div className={styles['table-container']}>
      {' '}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>名称</th>
            <th>年龄</th>
            <th>城市</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>张三</td>
            <td>25</td>
            <td>北京</td>
          </tr>
          <tr>
            <td>李四</td>
            <td>30</td>
            <td>上海</td>
          </tr>
          <tr>
            <td>王五</td>
            <td>28</td>
            <td>广州</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
