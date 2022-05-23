import Image from 'next/image'
import Leaderboard from 'components/Leaderboard/Leaderboard'
import WalletButton from 'common/WalletButton'
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
            <Leaderboard />
            <a>
              <WalletButton btnClass="walletButton" />
            </a>
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
      <img src="/honey/bee-01.png" className="v-header-top-bee" />
      <img src="/honey/bee-02.png" className="v-header-bottom-bee" />
    </div>
  )
}
export default HeaderDefault
