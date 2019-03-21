import OrderBook from "./OrderBook";

export default class StellarOrderBook extends OrderBook {
  constructor(data) {
    super(StellarOrderBook.formatOrderBook(data)) 
  }
  static formatOrderBook(book) {
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