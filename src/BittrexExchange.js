import axios from 'axios'
import { createHmac } from 'crypto'
import { Exchange } from './Exchange'

export class BittrexExchange extends Exchange {
  constructor(options = {}) {
    options.fee = 0.0025
    super(options)
    this._name = 'Bittrex'
    this._publicKey = process.env.BITTREX_PUBLIC_KEY
    this._privateKey = process.env.BITTREX_PRIVATE_KEY
    this._apiUrl = 'https://api.bittrex.com/api/v1.1'
    this._orderBookType = 'both'
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
  fetchBalances() {
    return new Promise((resolve, reject) => {
      const url = `${this._apiUrl}/account/getbalances?${this.privateParams}`
      axios
        .get(url, {
          headers: {
            apisign: this.createSignature(url),
          },
        })
        .then(response => {
          this._balances = this.formatBalances(
            response.data.result.filter(r => r.Balance > 0)
          )
          resolve()
        })
        .catch(error => {
          console.error('Could not get account balances on Bittrex.')
          reject(error)
        })
    })
  }
  fetchOpenOrders() {
    return new Promise((resolve, reject) => {
      const url = `${this._apiUrl}/market/getopenorders?${this.privateParams}`
      axios
        .get(url, {
          headers: {
            apisign: this.createSignature(url),
          },
        })
        .then(response => {
          this._openOrders = response.data.result
          resolve()
        })
        .catch(error => {
          console.error('Could not get Bittrex orders.')
          reject(error)
        })
    })
  }
  get privateParams() {
    const params = {
      apikey: this._publicKey,
      nonce: new Date().getTime(),
    }
    return encodeQueryData(params)
  }
  formatBalances(balances) {
    const newBal = []
    balances.forEach(item => {
      newBal.push({
        asset: item.Currency,
        balance: item.Balance,
        available: item.Available,
      })
    })
    return newBal
  }
  createSignature(url) {
    return createHmac('sha512', this._privateKey)
      .update(url)
      .digest('hex')
  }
  getOrder(id) {
    return new Promise((resolve, reject) => {
      const params = {
        apikey: this._publicKey,
        nonce: new Date().getTime(),
        uuid: id,
      }
      const url = `${this._apiUrl}/account/getorder?${encodeQueryData(params)}`
      axios
        .get(url, {
          headers: {
            apisign: this.createSignature(url),
          },
        })
        .then(response => {
          resolve(response.data.result)
        })
        .catch(e => {
          console.error(`Could not get Bittrex order ${id}.`)
          reject(error)
        })
    })
  }

  formatOrderBook(book) {
    const newBook = [
      {
        side: 'bids',
        orders: book.buy,
      },
      {
        side: 'asks',
        orders: book.sell,
      },
    ]
    newBook.forEach(side => {
      side.orders.forEach(order => {
        renameKey(order, 'Quantity', 'amount')
        renameKey(order, 'Rate', 'price')
      })
    })
    return Exchange.sortOrderBook(newBook)
  }
}
function renameKey(o, old_key, new_key) {
  if (old_key !== new_key) {
    Object.defineProperty(
      o,
      new_key,
      Object.getOwnPropertyDescriptor(o, old_key)
    )
    delete o[old_key]
  }
}
function encodeQueryData(data) {
  const ret = []
  for (let d in data)
    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]))
  return ret.join('&')
}
