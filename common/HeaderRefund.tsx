import AppBrand from 'common/AppBrand'
import WalletButton from './WalletButton'

const HeaderRefund = () => {
  return (
    <div className="container mx-auto">
      <div className={`flex h-20 justify-between px-5 text-white`}>
        <div className="flex items-center gap-3">
          <AppBrand />
        </div>
        <div className="relative my-auto flex items-center align-middle">
          <ul className="mb-2 flex">
            <li>
              <a
                className="pr-8 text-base font-bold text-white hover:text-white"
                href="https://honey.land/"
              >
                Home
              </a>
            </li>
            <li>
              <a
                className="pr-8 text-base font-bold text-white hover:text-white"
                href=""
              >
                Explore
              </a>
            </li>

            <li>
              <a
                className="pr-8 text-base font-bold text-white hover:text-white"
                href=""
              >
                Contact us
              </a>
            </li>
          </ul>
          <WalletButton />
        </div>
      </div>
    </div>
  )
}
export default HeaderRefund
