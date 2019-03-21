import OrderBook from './OrderBook'
import { renameKey } from './utils'

export default class BittrexOrderBook extends OrderBook {
  constructor(data) {
    super(BittrexOrderBook.formatOrderBook(data))
  }
  static formatOrderBook(book) {
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
    return OrderBook.sortOrderBook(newBook)
  }
}
