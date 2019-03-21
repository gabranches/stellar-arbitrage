export default class OrderBook {
  constructor() {}
  getSummary(b) {
    let book = _.cloneDeep(b)
    book.forEach(side => {
      side.orders = this.getSummaryAmounts(side.orders)
    })
    return this.weightedBook(book)
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
}
