import API from './API'
import { encodeQueryData } from './utils'

export default class BittrexAPI extends API {
  constructor() {
    const params = {
      url: 'https://api.bittrex.com/api/v1.1',
      publicKey: process.env.BITTREX_PUBLIC_KEY,
      privateKey: process.env.BITTREX_PRIVATE_KEY,
    }
    super(params)
  }
  get privateParams() {
    const params = {
      apikey: this.publicKey,
      nonce: new Date().getTime(),
    }
    return encodeQueryData(params)
  }
}
