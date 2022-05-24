import PropTypes from 'prop-types'
import { useState } from 'react'

export default function BasicImage(props) {
  const { src: _1, fallbackSrc: _2, ...otherProps } = props
  const [src, setSrc] = useState(props.src)
  const [error, setError] = useState(false)
  const onError = () => {
    if (!error) {
      setError(true)
      setSrc(props.fallbackSrc)
    }
  }
  return <img src={src} onError={onError} {...otherProps} />
}

BasicImage.propTypes = {
  src: PropTypes.string,
  fallbackSrc: PropTypes.string,
}
