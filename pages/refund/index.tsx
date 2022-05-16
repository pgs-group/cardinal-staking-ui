import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { fetchNfts } from 'api/api_custom'

import DefaultLayout from 'components/Layouts/Default'
import BasicCard from 'components/BasicCard'
import GridFilters from 'components/GridFilters'
import BasicBreadcrumb from 'common/BasicBreadcrumb'
import CardPlaceholder from 'components/BasicCard/CardPlaceholder'

export default function RefundPage() {
  const { wallet, publicKey, connecting, connected } = useWallet()
  const [cards, setCards] = useState([])
  const [filters, setFilters] = useState({})
  const [loading, setLoading] = useState(false)

  const filteredCards = () => {
    if (!cards || !cards.length) return []
    if (!filters.search) return cards
    return cards.filter((card) => {
      return !(card.name.indexOf(filters.search) > -1)
    })
  }

  useEffect(() => {
    if (!publicKey) return
    setCards([])
    setLoading(true)
    fetchNfts(publicKey, filters).then((res) => {
      setCards(res)
      setLoading(false)
    })
  }, [publicKey, filters.type])

  return (
    <>
      <div className="container container-custom mx-auto flex-auto py-10">
        <BasicBreadcrumb title="Explore" />
        {publicKey && (
          <GridFilters
            filters={filters}
            updateFilters={(val) => setFilters(val)}
          />
        )}
        {!wallet && !connecting && !connected && (
          <h3 className="py-10 text-center text-2xl text-white">
            Please connect to your wallet
          </h3>
        )}
        <div className="grid justify-center gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {filteredCards().map((card, index) => (
            <BasicCard data={card} key={index} />
          ))}
          {loading && <CardPlaceholder />}
          {loading && <CardPlaceholder />}
          {loading && <CardPlaceholder />}
          {loading && <CardPlaceholder />}
          {loading && <CardPlaceholder />}
          {loading && <CardPlaceholder />}
          {loading && <CardPlaceholder />}
          {loading && <CardPlaceholder />}
          {loading && <CardPlaceholder />}
          {loading && <CardPlaceholder />}
          {loading && <CardPlaceholder />}
        </div>
      </div>
    </>
  )
}

RefundPage.getLayout = function getLayout(page) {
  return <DefaultLayout>{page}</DefaultLayout>
}
