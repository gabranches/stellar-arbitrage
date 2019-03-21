import exchanges from './exchanges'
import _ from 'lodash'
import { TradeBuilder } from './TradeBuilder'
import StellarExchange from './StellarExchange'

export class Arbitrage {
  constructor() {
    this._exchanges = []
    this._markets = []
    this._cmc = new exchanges.cmc()
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
  min(min) {
    this._min = min
    return this
  }
  trade() {
    return new TradeBuilder(this._markets, this._cmc)
  }
  execute(exec) {
    return new Promise(async (resolve, reject) => {
      try {
        // Initialize exchanges
        await this._exchanges[0].init()
        await this._exchanges[1].init()
        const trade1 = this.trade()
          .sell(this._markets[0].tag)
          .buy(this._markets[1].tag)
          .execute(exec)
        const trade2 = this.trade()
          .sell(this._markets[1].tag)
          .buy(this._markets[0].tag)
          .execute(exec)
        await Promise.all([trade1, trade2])
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
  init() {
    return new Promise(async (resolve, reject) => {
      try {
        const initArr = []
        this._marketTags.forEach(tag => {
          let [name, base] = tag.split('-')
          const xch = new exchanges[name]({
            asset: this._asset,
            base: base,
            min: this._min,
            tag: tag,
          })
          this._markets.push(xch)
          initArr.push(xch.init())
        })
        await Promise.all(initArr)
        resolve(this)
      } catch (error) {
        reject(error)
      }
    })
  }
  findProfit(x1, x2) {
    const x1Rate = this._cmc.price(x1.base, 'USD')
    const x2Rate = this._cmc.price(x2.base, 'USD')
    this.analyzeTrade({
      sell: {
        exchange: x1,
        rate: x1Rate,
      },
      buy: {
        exchange: x2,
        rate: x2Rate,
      },
    })
    this.analyzeTrade({
      sell: {
        exchange: x2,
        rate: x2Rate,
      },
      buy: {
        exchange: x1,
        rate: x1Rate,
      },
    })
  }
  analyzeTrade(trade) {
    const sell = _.find(trade.sell.exchange.summary, { side: 'bids' })
    const buy = _.find(trade.buy.exchange.summary, { side: 'asks' })
    const amount = Math.min(sell.totalAmount, buy.totalAmount)
    const sellExchange = trade.sell.exchange
    // const buyExchange

    const action = {
      sell: {
        pair: trade.sell.exchange.pair,
        base: trade.sell.exchange.base,
        exchange: trade.sell.exchange.name,
        available: _.find(trade.sell.exchange.balances, {
          asset: trade.sell.exchange.pair,
        }).available,
        amount: amount,
        price: sell.weightedPrice,
        priceUSD: trade.sell.rate * sell.weightedPrice,
        totalUSD: amount * trade.sell.rate * sell.weightedPrice,
        fee:
          amount *
          trade.sell.rate *
          sell.weightedPrice *
          trade.sell.exchange.fee,
      },
      buy: {
        pair: trade.buy.exchange.pair,
        base: trade.buy.exchange.base,
        exchange: trade.buy.exchange.name,
        available: _.find(trade.buy.exchange.balances, {
          asset: trade.buy.exchange.base,
        }).available,
        amount: amount,
        price: buy.weightedPrice,
        priceUSD: trade.buy.rate * buy.weightedPrice,
        totalUSD: amount * trade.buy.rate * buy.weightedPrice,
        fee:
          amount * trade.buy.rate * buy.weightedPrice * trade.buy.exchange.fee,
      },
    }
    action.profit =
      action.sell.totalUSD -
      (action.buy.totalUSD + action.buy.fee + action.sell.fee)
    action.execute = action.profit > 0 ? true : false
    console.log('----------------')
    if (action.execute) {
      console.log('BEGIN PROFITABLE TRADE')
    } else {
      console.log('NO TRADE')
    }
    console.log('----------------')
    console.log(action)
  }
}

const timer = time => {
  return new Promise((resolve, reject) => {
    console.log(`Waiting ${time} ms...`)
    setTimeout(() => resolve(), time)
  })
}
