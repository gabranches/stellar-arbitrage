import OrderBook from "./OrderBook";

export default class StellarOrderBook extends OrderBook {
  constructor(data) {
    this._orderBook = this.formatOrderBook(data)
    this._summary = this.getSummary(this._orderBook)
  }
  formatOrderBook(book) {
    book.bids.forEach(order => {
      order.price = 1 / order.price
      order.amount = Number(order.amount)
      delete order.price_r
    })
    book.asks.forEach(order => {
      order.price = 1 / order.price
      order.amount = Number(order.amount)
      delete order.price_r
    })
    return OrderBook.sortOrderBook([
      {
        side: 'bids',
        orders: book.asks,
      },
      {
        side: 'asks',
        orders: book.bids,
      },
    ])
  }
}