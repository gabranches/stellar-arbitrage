const _ = require('lodash')

module.exports = class Exchange {
  constructor(options) {
    Object.keys(options).forEach(key => {
      this._asset = options.asset
      this._base = options.base
      this._min = options.min
      this._max = options.max || this._min * 10
      this._fee = options.fee || 0
      this._tag = options.tag
    })
  }
  init() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.fetchBalances()
        this.logBalances()
        await this.fetchOrderBook()

        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
  balance(ticker) {
    if (!this._balances) throw Error(`${this._name} balances not set.`)
    if (ticker) {
      const asset = _.find(this._balances, { asset: ticker })
      if (asset) {
        return this._balances.filter(b => b.asset === ticker)[0].available
      } else {
        return 0
      }
    }
    return this._balances
  }
  static sortOrderBook(book) {
    book.forEach(side => {
      if (side.side === 'bids') {
        side.orders = _.orderBy(side.orders, ['price'], ['desc'])
      } else {
        side.orders = _.orderBy(side.orders, ['price'], ['asc'])
      }
    })
    return book
  }
  getSummary(b) {
    let book = _.cloneDeep(b)
    book.forEach(side => {
      side.orders = this.getSummaryAmounts(side.orders)
    })
    return this.weightedBook(book)
  }
  getSummaryAmounts(orders) {
    let totalAmount = 0
    let lastAmount = 0
    const book = []
    orders.some(order => {
      lastAmount = totalAmount
      totalAmount += order.amount
      if (totalAmount > this._max) {
        book.push({
          price: order.price,
          amount: this._max - lastAmount,
        })
        return true
      }
      book.push({
        price: order.price,
        amount: order.amount,
      })
      if (totalAmount > this._min && totalAmount < this._max) return true
    })
    return book
  }
  weightedBook(book) {
    book.forEach(side => {
      if (side.side == 'asks') {
        side.orderPrice = _.maxBy(side.orders, 'price').price
      } else {
        side.orderPrice = _.minBy(side.orders, 'price').price
      }
      const w = this.getWeightedPrice(side.orders)
      side.weightedPrice = w.weightedPrice
      side.totalAmount = w.totalAmount
    })
    return book
  }
  getWeightedPrice(orders) {
    let total = 0
    let totalAmount = 0
    orders.forEach(order => {
      total += order.price * order.amount
      totalAmount += order.amount
    })
    return { weightedPrice: total / totalAmount, totalAmount: totalAmount }
  }
  get tag() {
    return this._tag
  }
  get fee() {
    return this._fee
  }
  get name() {
    return this._name || Error('Name not set.')
  }
  get asset() {
    return this._asset || Error('Pair not set.')
  }
  get base() {
    return this._base || Error('Base not set.')
  }
  get summary() {
    return this._summary || Error('No summary.')
  }
  get orderBook() {
    if (!this._orderBook) {
      throw Error(`No order book for ${this._name}.`)
    }
    return this._orderBook
  }
  get ready() {
    if (!this._openOffers) return false
    return this._openOffers.length > 0 ? true : false
  }
  get balances() {
    return this._balances || Error('Balances not set.')
  }
  logBalances() {
    console.log('------------------------')
    console.log(`${this._name} Balances`)
    console.log('------------------------')
    console.log(this._balances)
  }
}
