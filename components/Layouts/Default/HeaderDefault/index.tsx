import Image from 'next/image'

const HeaderDefault = () => {
  return (
    <div className="v-header">
      <div className="v-header-logo">
        <img src="/honey/honeyland-logo.png" width="100%" />
      </div>
      <div className="v-header-content">
        <div className="v-header-menu">
          <div className="v-header-menu-title">GENESIS EGG INCUBATOR</div>
          <div className="v-header-menu-buttons">
            <a>LEADERBOARD</a>
            <a>CONNECT WALLET</a>
          </div>
        </div>
        <div className="v-header-statistics">
          <div className="v-header-statistics-box">
            <div className="v-header-statistics-box__count">48%</div>
            <div className="v-header-statistics-box__title">
              % of Genesis Eggs Incubating
            </div>
          </div>
          <div className="v-header-statistics-box">
            <div className="v-header-statistics-box__count">48%</div>
            <div className="v-header-statistics-box__title">
              % of Genesis Eggs Incubating
            </div>
          </div>
          <div className="v-header-statistics-box">
            <div className="v-header-statistics-box__count">48%</div>
            <div className="v-header-statistics-box__title">
              % of Genesis Eggs Incubating
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default HeaderDefault
