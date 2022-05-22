import cn from 'classnames'
import HeaderDefault from './HeaderDefault'
import HeadDefault from './HeadDefault'
export default function DefaultLayout({
  children,
  className,
}: {
  children: JSX.Element | JSX.Element[] | string
  className: string
}) {
  return (
    <div className={cn('default-layout container mx-auto w-full', className)}>
      <HeadDefault />
      <HeaderDefault />
      <div className="header">HoneyLand</div>
      {/* children */}
    </div>
  )
}
