import HeadDefault from './HeadDefault'
import HeaderDefault from './HeaderDefault'
import FooterDefault from './FooterDefault/FooterDefault'
import MainDefault from './MainDefault'
import cn from "classnames"
export default function DefaultLayout({ children , className }) {
  return (
    <div className={cn("default-layout min-h-screen flex flex-col",className)} >
      <HeadDefault />
      <HeaderDefault />
      <MainDefault>{children}</MainDefault>
      <FooterDefault />
    </div>
  )
}
