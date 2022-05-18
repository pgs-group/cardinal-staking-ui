import { useEffect, useState } from 'react'

import Placeholder from 'components/BasicCard/CardPlaceholder'
import { getNft } from 'api/api_custom'

export default function BasicCard({ data, refund = true }) {
  const [card, setCard] = useState({})
  const isValidImage = (image) => {
    return image && image.toLowerCase().match(/(jpg|png|gif)/g)
  }
  useEffect(() => {
    if (!data) return
    if (!data.uri) {
      setCard(data)
      return
    }
    getNft(data.uri).then((res) => {
      setCard({ ...data, image: res.data?.image })
    })
  }, [data])
  if (!card) return <Placeholder />
  return (
    <div className="card nft-card mx-auto flex h-[400px] w-full flex-col rounded-3xl p-6 text-center lg:h-[450px] xl:h-[550px]">
      <a className="flex justify-center">
        {isValidImage(card.image) ? (
          <img
            className=" h-[230px] w-full rounded-3xl object-cover transition hover:bg-cyan-300 lg:h-[280px] xl:h-[375px]"
            src={card.image}
          />
        ) : (
          <div className="mx-auto h-[230px] w-full space-y-2 rounded-3xl bg-slate-800 object-cover p-6 transition hover:bg-slate-500 lg:h-[280px] xl:h-[375px]" />
        )}
      </a>
      <h4 className="mt-5 truncate text-center text-xl  font-bold text-white transition hover:text-cyan-300 xl:text-2xl">
        {card.name}
      </h4>
      <a className="mt-auto block text-center">
        {card.name && refund && (
          <button
            type="button"
            className="bg-refund-button mt-3 inline-block w-48 rounded-xl px-6 py-3 text-lg font-semibold leading-normal text-white transition duration-150 ease-in-out hover:bg-yellow-600 focus:outline-none focus:ring-0"
          >
            Refund NFT
          </button>
        )}
      </a>
    </div>
  )
}
