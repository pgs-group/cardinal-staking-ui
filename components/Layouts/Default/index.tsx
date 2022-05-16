import HeadDefault from './HeadDefault'
import HeaderDefault from './HeaderDefault'
import FooterDefault from './FooterDefault/FooterDefault'
import MainDefault from './MainDefault'
export default function DefaultLayout({ children }) {
  return (
    <div className="default-layout flex h-screen flex-col">
      <HeadDefault />
      <HeaderDefault />
      <MainDefault>{children}</MainDefault>
      <FooterDefault />
    </div>
  )
}
