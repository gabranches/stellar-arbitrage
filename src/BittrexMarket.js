import Market from './Market'
import axios from 'axios'
import BittrexOrderBook from './BittrexOrderBook'
import { encodeQueryData } from './utils'

export default class BittrexMarket extends Market {
  constructor(params) {
    super(params)
  }
  fetchOrderBook() {
    return new Promise((resolve, reject) => {
      axios
        .get(`${this._api.url}/public/getorderbook`, {
          params: {
            market: `${this._base}-${this._asset}`,
            type: 'both',
          },
        })
        .then(response => {
          this._orderBook = new BittrexOrderBook(response.data.result)
          resolve()
        })
        .catch(error => {
          console.error('Could not get Bittrex order book.')
          reject(error)
        })
    })
  }
  limitOrder(order) {
    return new Promise((resolve, reject) => {
      const params = {
        apikey: this._publicKey,
        nonce: new Date().getTime(),
        market: `${order.base}-${order.asset}`,
        quantity: order.amount,
        rate: order.price,
      }
      const url = `${
        this._api.url
      }/market/${order.type.toLowerCase()}limit?${encodeQueryData(params)}`
      axios
        .get(url, {
          headers: {
            apisign: this._api.createSignature(url),
          },
        })
        .then(response => {
          if (response.data.success) {
            resolve(response.data)
          } else {
            reject(Error('Failed to place order on Bittrex.'))
          }
        })
        .catch(e => {
          console.error('Could not place buy limit order on Bittrex.')
          reject(error)
        })
    })
  }
  
}
