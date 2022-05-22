import Image from 'next/image'
import cn from 'classnames'

import styles from './StakingBox.module.scss'
import sampleImg from 'assets/img/egg.png'
import StopWatchIcon from 'assets/icons/stopwatch.svg'
export default function StakingBox() {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>select eggs to incubate</h3>
      <div className={cn(styles.grid, 'custom-scrollbar')}>
        {[...Array(10)].map((n, i) => (
          <div className={styles.gridItem} key={i}>
            <div className={styles.card}>
              <Image className={styles.image} src={sampleImg} alt="" />
              <div className={styles.detail}>
                {/* <span className={styles.title}>Queen Egg</span> */}
                <span className={styles.title}>#1046</span>
                <span className={styles.timeAgo}>
                  <Image src={StopWatchIcon} />
                  <span>27 days</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.footer}>
        <button className={styles.button}>Incubate</button>
      </div>
    </div>
  )
}
