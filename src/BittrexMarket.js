import Market from './Market'

export default class BittrexMarket extends Market {
  constructor() {
    super()
  }
  fetchOrderBook() {
    return new Promise((resolve, reject) => {
      axios
        .get(`${this._apiUrl}/public/getorderbook`, {
          params: {
            market: `${this._base}-${this._asset}`,
            type: this._orderBookType,
          },
        })
        .then(response => {
          this._orderBook = this.formatOrderBook(response.data.result)
          this._summary = this.getSummary(this._orderBook)
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
        this._apiUrl
      }/market/${order.type.toLowerCase()}limit?${encodeQueryData(params)}`
      axios
        .get(url, {
          headers: {
            apisign: this.createSignature(url),
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
