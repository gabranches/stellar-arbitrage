export default class Market {
  constructor(params) {
    this._asset = params.asset
    this._base = params.base
    this._api = params.api
    this._tag = params.tag
  }
  init() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.fetchOrderBook()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
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
    return this._tag || Error('Tag not set.')
  }
}