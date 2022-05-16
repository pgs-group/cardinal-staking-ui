import Link from 'next/link'
import AppBrand from 'common/AppBrand'
import WalletButton from './WalletButton'

const HeaderRefund = () => {
  return (
    <div className="container mx-auto">
      <div className={`flex h-20 justify-between text-white`}>
        <div className="flex items-center gap-3">
          <AppBrand />
        </div>
        <div className="relative my-auto flex items-center align-middle">
          <ul className="mb-0 flex">
            <li>
              <a
                className="pr-8 text-base font-semibold text-white hover:text-white"
                href="https://honey.land/"
              >
                Home
              </a>
            </li>
            <li>
              <Link href="/refund">
                <a className="pr-8 text-base font-semibold text-white hover:text-white">
                  Explore
                </a>
              </Link>
            </li>
            <li>
              <a
                className="pr-8 text-base font-semibold text-white hover:text-white"
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
