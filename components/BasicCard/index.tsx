import { useEffect, useState } from 'react'

import { getNft } from 'api/api_custom'

export default function BasicCard({ data }) {
  const [card, setCard] = useState({})
  useEffect(() => {
    if (!data) return
    getNft(data.uri).then((res) => setCard(res.data))
  }, [data])
  if (!card) return <div></div>
  return (
    <div className="card h-[25rem] w-80 space-y-4 rounded-xl bg-[#15263F] p-4">
      <a href="#">
        <img
          className="h-64 w-full rounded-md transition hover:bg-cyan-300"
          src={card.image}
          alt={card.name}
        />
      </a>
      <div className="space-y-4">
        <a href="#">
          <h2 className="text-center text-xl font-semibold text-white transition hover:text-cyan-300">
            {data.name}
          </h2>
          <button
            type="button"
            className="mt-2 inline-block w-full rounded-lg bg-yellow-500 px-6 py-2.5 text-base font-bold leading-normal text-white shadow-md transition duration-150 ease-in-out hover:bg-yellow-600 hover:shadow-lg focus:bg-yellow-600 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-yellow-700 active:shadow-lg"
          >
            Refund
          </button>
        </a>
      </div>
    </div>
  )
}
