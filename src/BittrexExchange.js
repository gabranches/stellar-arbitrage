import axios from 'axios'
import { createHmac } from 'crypto'
import Exchange from './Exchange'
import { encodeQueryData, renameKey } from './utils'
import BittrexMarket from './BittrexMarket';
import BittrexAPI from './BittrexAPI';

export default class BittrexExchange extends Exchange {
  constructor(options = {}) {
    options.tag = 'bittrex'
    options.name = 'Bittrex',
    options.fee = 0.0025
    super(options)
    this._api = new BittrexAPI()
    this._market = new BittrexMarket(this._asset, this._base, this._api)
  }
  fetchBalances() {
    return new Promise((resolve, reject) => {
      const url = `${this._api.url}/account/getbalances?${this._api.privateParams}`
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
      const url = `${this._api.url}/market/getopenorders?${this._api.privateParams}`
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
    return createHmac('sha512', this._api.privateKey)
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
      const url = `${this._api.url}/account/getorder?${encodeQueryData(params)}`
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

