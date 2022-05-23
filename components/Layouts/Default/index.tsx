import { useEffect, useState } from 'react'

import cn from 'classnames'
import HeaderDefault from './HeaderDefault'
import HeadDefault from './HeadDefault'
import { LoadingSpinner } from 'common/LoadingSpinner'
export default function DefaultLayout({
  children,
  className,
}: {
  children: JSX.Element | JSX.Element[] | string
  className: string
}) {
  const [screenLoading, setScreenLoading] = useState(true)
  useEffect(() => {
    window.onload = () => {
      setScreenLoading(false)
    }
  }, [])
  return (
    <>
      {screenLoading ? (
        <div className="screen-loading">
          <LoadingSpinner height="100px" />
        </div>
      ) : (
        <div
          className={cn('default-layout container mx-auto w-full', className)}
        >
          <HeadDefault />
          <HeaderDefault />
          {children}
        </div>
      )}
    </>
  )
}
