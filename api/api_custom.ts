import axios from 'axios'
import {
  wallet_analyzer_for_nft,
  getAllNftData,
  nftResponseAdaptor,
} from './modules'
import { NFT_UPDATE_AUTH, THRESHOLD, CLUSTER_URL } from './constants'

export async function getNfts(publicKey) {
  return wallet_analyzer_for_nft(
    CLUSTER_URL,
    publicKey,
    NFT_UPDATE_AUTH,
    THRESHOLD
  )
}

export async function getAllNfts() {
  return getAllNftData()
}
export async function getNft(uri) {
  const response = await axios.get(uri)
  return response
}

export async function fetchNfts(publicKey, filters) {
  const response =
    filters.type === 'refundable'
      ? await getNfts(publicKey)
      : await getAllNftData()
  let result = response?.map((item) => nftResponseAdaptor(item))
  return result
}
