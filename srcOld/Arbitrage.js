const exchanges = require('./exchanges')
const _ = require('lodash')
const TradeBuilder = require('./TradeBuilder')

module.exports = class Arbitrage {
  constructor() {
    this._marketTags = []
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
  addMarket(market) {
    this._marketTags.push(market)
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
        await this.init()
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
