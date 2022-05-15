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
    <div className="card h-[23.7rem] w-80 space-y-2 rounded-2xl bg-slate-700 p-4">
      <a href="#">
        {card.image && card.image.toLowerCase().match(/(jpg|png|gif)/g) && (
          <Image
            className="h-64 w-full rounded-xl object-cover transition hover:bg-cyan-300"
            width="300"
            height="256"
            src={card.image}
            alt={card.name}
          />
        )}
        {card.image && !card.image.toLowerCase().match(/(jpg|png|gif)/g) && (
          <div className="w-70 h-64 rounded-xl bg-slate-700 object-cover transition hover:bg-slate-500" />
        )}
        {card && !card.image && (
          <div className="w-70 h-64 rounded-xl bg-slate-700 object-cover transition hover:bg-slate-500" />
        )}
      </a>
      <div className='mt-2'>
        <a href="#" className="block text-center">
          <h2 className="text-center text-lg font-semi-bold text-white transition hover:text-cyan-300">
            {data.name}
          </h2>
          {refund && (
            <button
              type="button"
              className="bg-refund-button mt-1 inline-block w-36 rounded-lg px-6 py-2.5 text-base font-bold leading-normal text-white shadow-md transition duration-150 ease-in-out hover:bg-yellow-600 hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg"
            >
              Refund
            </button>
          )}
        </a>
      </div>
    </div>
  )
}
