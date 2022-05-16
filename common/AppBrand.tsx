import Image from 'next/image'
import AppLogo from 'assets/img/logo.png'
export default function AppBrand() {
  return (
    <a href="https://honey.land/" className="flex items-center justify-center">
      <Image src={AppLogo} alt="Honeyland logo" width="64" height="64" />
      <h1 className='pl-3 text-3xl font-semibold mb-0 text-white'>Honeyland</h1>
    </a>
  )
}
