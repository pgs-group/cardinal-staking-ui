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
    <div className="card-wrapper-grid-item">
      {isValidImage(card.image) ? (
        <img src={card.image} />
      ) : (
        <div className="mx-auto h-[200px]" />
      )}

      <h4>{card.name}</h4>
      <a>{card.name && refund && <button type="button">REFUND</button>}</a>
    </div>
  )
}
