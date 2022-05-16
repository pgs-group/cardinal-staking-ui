import Image from 'next/image'
import AppLogo from 'assets/img/logo.png'
export default function AppBrand() {
  return (
    <a href="https://honey.land/" className="flex items-center justify-center">
      <img src="https://honey.land/images/logo.png" alt="Honeyland logo" width="64" height="64" />
      <h1 className="mb-0 pl-3 text-3xl font-semibold text-white">Honeyland</h1>
    </a>
  )
}
