import  OrderBook from './OrderBook'

export default class BittrexOrderBook extends OrderBook {
  constructor() {
    super()
    this._orderBookType = 'both'
  }
}