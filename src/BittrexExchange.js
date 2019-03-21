import axios from 'axios'
import { createHmac } from 'crypto'
import Exchange from './Exchange'
import { encodeQueryData, renameKey } from './utils'
import BittrexMarket from './BittrexMarket';

export default class BittrexExchange extends Exchange {
  constructor(options = {}) {
    options.tag = 'bittrex'
    options.name = 'Bittrex',
    options.fee = 0.0025
    options.apiUrl = 'https://api.bittrex.com/api/v1.1'
    super(options)
    this._publicKey = process.env.BITTREX_PUBLIC_KEY
    this._privateKey = process.env.BITTREX_PRIVATE_KEY
    this._market = new BittrexMarket(this._asset, this._base)
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
  get privateParams() {
    const params = {
      apikey: this._publicKey,
      nonce: new Date().getTime(),
    }
    return encodeQueryData(params)
  }
}

