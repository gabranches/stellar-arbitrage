export default class Market {
  constructor() {

  }
  get asset() {
    return this._asset || Error('Pair not set.')
  }
  get base() {
    return this._base || Error('Base not set.')
  }
  get orderBook() {
    if (!this._orderBook) {
      throw Error(`No order book for ${this._name}.`)
    }
    return this._orderBook
  }
  get summary() {
    return this._summary || Error('No summary.')
  }
  get tag() {
    return this._tag
  }
}