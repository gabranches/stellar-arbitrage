import _ from 'lodash'

export default class Exchange {
  constructor(options) {
    Object.keys(options).forEach(key => {
      this._asset = options.asset
      this._base = options.base
      this._min = options.min
      this._max = options.max || this._min * 2
      this._fee = options.fee || 0
      this._tag = options.tag
    })
  }
  init() {
    console.log(`${this._name} init()`)
    return new Promise(async (resolve, reject) => {
      try {
        await this.fetchOpenOrders()
        this.checkOpenOrders()
        await this.fetchBalances()
        await this.logBalances()
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

  logBalances() {
    console.log('------------------------')
    console.log(`${this._name} Balances`)
    console.log('------------------------')
    console.log(this._balances)
  }
  checkOpenOrders() {
    if (this.openOrders.length > 0) throw Error(`Orders open on ${this._tag}.`)
  }
  get fee() {
    return this._fee
  }
  get name() {
    return this._name || Error('Name not set.')
  }
  get ready() {
    if (!this._openOffers) return false
    return this._openOffers.length > 0 ? true : false
  }
  get balances() {
    return this._balances || Error('Balances not set.')
  }
  get openOrders() {
    return this._openOrders
  }
}
