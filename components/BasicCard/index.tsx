import { useEffect, useState } from 'react'
import Image from 'next/image'

import Placeholder from 'components/BasicCard/Placeholder'

import { getNft } from 'api/api_custom'

export default function BasicCard({ data, refund = true }) {
  const [card, setCard] = useState({})
  useEffect(() => {
    if (!data) return
    getNft(data.uri).then((res) => setCard(res.data))
  }, [data])
  if (!card) return <Placeholder />
  return (
    <div className="card nft-card mx-auto h-[545px] w-[375px] space-y-2 rounded-3xl p-6 text-center">
      <a href="#" className="flex justify-center">
        {card.image && card.image.toLowerCase().match(/(jpg|png|gif)/g) && (
          <Image
            className="rounded-3xl object-cover transition hover:bg-cyan-300"
            width="322"
            height="370"
            src={card.image}
            alt={card.name}
          />
        )}
        {card.image && !card.image.toLowerCase().match(/(jpg|png|gif)/g) && (
          <div className="mx-auto h-[370px] w-[322px] space-y-2 rounded-3xl bg-slate-800 object-cover p-6 transition hover:bg-slate-500" />
        )}
        {card && !card.image && (
          <div className="mx-auto h-[370px] w-[322px] space-y-2 rounded-3xl bg-slate-800 object-cover p-6 transition hover:bg-slate-500" />
        )}
      </a>
      <div className="mt-4">
        <a href="#" className="block text-center">
          <h4 className="mt-4 text-center text-2xl font-bold text-white transition hover:text-cyan-300">
            {card.name}
          </h4>
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
    </div>
  )
}
