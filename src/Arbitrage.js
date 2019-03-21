import _ from 'lodash'
import { TradeBuilder } from './TradeBuilder'
import StellarExchange from './StellarExchange'
import BittrexExchange from './BittrexExchange'
import CoinMarketCap from './CoinMarketCap'

export class Arbitrage {
  constructor() {
    this._exchanges = []
    this._cmc = new CoinMarketCap()
    ;(async () => {
      await this._cmc.fetchData()
    })()
  }
  asset(asset) {
    this._asset = asset
    return this
  }
  addMarket(id) {
    const [tag, base] = id.split('-')
    let exchange
    switch (tag) {
      case 'sdex':
        exchange = new StellarExchange({ asset: this._asset, base })
        break
      case 'bittrex':
        exchange = new BittrexExchange({ asset: this._asset, base })
        break
      default:
        throw Error('Market tag does not exist.')
    }
    this._exchanges.push(exchange)
    return this
  }
  min(x) {
    this._min = x
    return this
  }
  trade() {
    return new TradeBuilder(this._cmc)
  }
  execute(exec) {
    return new Promise(async (resolve, reject) => {
      try {
        // Initialize exchanges
        await this._exchanges[0].init()
        await this._exchanges[1].init()
        // Initialize trades
        const trade1 = this.trade()
          .min(this._min)
          .sell(this._exchanges[0])
          .buy(this._exchanges[1])
          .execute(exec)
        const trade2 = this.trade()
          .min(this._min)
          .sell(this._exchanges[1])
          .buy(this._exchanges[0])
          .execute(exec)
        await Promise.all([trade1, trade2])
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
}
