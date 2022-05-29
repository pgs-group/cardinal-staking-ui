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
  const [filters, setFilters] = useState({ type: '', search: '' })
  const [loading, setLoading] = useState(false)

  const filteredCards = () => {
    if (!cards || !cards.length) return []
    if (!filters.search) return cards
    return cards.filter((card) => {
      const result = card.name.indexOf(filters.search)
      return result > -1
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
      <div className="container mx-auto">
        <div className="card-wrapper">
          {publicKey && (
            <GridFilters
              filters={filters}
              updateFilters={(val) =>
                setFilters((oldVal) => ({ ...oldVal, ...val }))
              }
            />
          )}
          <div className="card-wrapper-grid custom-scrollbar">
            {filteredCards().length === 0 && cards.length !== 0 && (
              <h4 className="mt-20 text-center text-2xl font-semibold text-white">
                Your Search has no result
              </h4>
            )}
            {filteredCards().map((card, index) => (
              <BasicCard data={card} key={index} />
            ))}
            {loading && <CardPlaceholder />}
            {loading && <CardPlaceholder />}
            {loading && <CardPlaceholder />}
            {loading && <CardPlaceholder />}
          </div>
        </div>
      </div>
    </>
  )
}

RefundPage.getLayout = function getLayout(page) {
  return <DefaultLayout className="bg-staking-pool">{page}</DefaultLayout>
}
