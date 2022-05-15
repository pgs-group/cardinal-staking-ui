import axios from 'axios'
import { wallet_analyzer_for_nft, getAllNftData } from './modules'
import { NFT_UPDATE_AUTH, THRESHOLD, CLUSTER_URL } from './constants'
import nft_list_sample from './nft_list_sample.json'
import nft_sample from './nft_sample.json'

export async function getNfts(publicKey) {
  //   return wallet_analyzer_for_nft(
  //     CLUSTER_URL,
  //     publicKey,
  //     NFT_UPDATE_AUTH,
  //     THRESHOLD
  //   )
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(nft_list_sample)
    }, 2000)
  })
}

export async function getAllNfts() {
  //   return getAllNftData()
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(nft_list_sample)
    }, 2000)
  })
}
export async function getNft(uri) {
  const response = await axios.get(uri)
  return response
}

export async function fetchNfts(publicKey, filters) {
  if (filters.type === 'refundable') {
    return await getNfts(publicKey)
  } else {
    return await getAllNfts()
  }
}