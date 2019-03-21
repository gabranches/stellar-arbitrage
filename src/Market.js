export default class Market {
  constructor(asset, base, api) {
    this._asset = asset
    this._base = base
    this._api = api
  }
  init() {
    console.log(`${this._tag}-${this._asset}/${this._base} init()`)
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
    return this._tag
  }
}