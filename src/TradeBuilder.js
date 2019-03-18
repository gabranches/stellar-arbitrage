const _ = require('lodash')

module.exports = class TradeBuilder {
  constructor(markets, cmc) {
    this._markets = markets
    this._cmc = cmc
  }
  sell(tag) {
    this._sellMarket = _.find(this._markets, { tag: tag })
    return this
  }
  buy(tag) {
    this._buyMarket = _.find(this._markets, { tag: tag })
    return this
  }
  asset() {
    this._asset = asset
    return this
  }
  min(min) {
    this._min = min
    return this
  }
  execute(exec) {
    return new Promise(async (resolve, reject) => {
      this._asset = this._sellMarket.asset
      this._trade = this.buildTrade()
      this.logSummary()
      const sellOrder = this.buildOrder('SELL', this._trade.sell)
      const buyOrder = this.buildOrder('BUY', this._trade.buy)
      try {
        if (exec) {
          if (this._trade.execute) {
            console.log('------------------------')
            console.log('EXECUTE')
            console.log('------------------------')
            console.log(sellOrder)
            console.log(buyOrder)
            const pS = this._sellMarket.limitOrder(sellOrder)
            const pB = this._buyMarket.limitOrder(buyOrder)
            await Promise.all([pS, pB])
          }
        }
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
  buildOrder(type, o) {
    return {
      type: type,
      asset: o.asset,
      base: o.market.split('-')[1],
      amount: o.amount,
      price: o.price,
    }
  }
  buildTrade() {
    const sell = this._sellMarket
    const buy = this._buyMarket
    const sellSummary = _.find(sell.summary, { side: 'bids' })
    const buySummary = _.find(buy.summary, { side: 'asks' })
    const sellRate = this._cmc.price(sell.base, 'USD')
    const buyRate = this._cmc.price(buy.base, 'USD')
    const amount = Math.min(sellSummary.totalAmount, buySummary.totalAmount)
    const action = {
      sell: {
        asset: sell.asset,
        market: sell.tag,
        amount: amount,
        available: sell.balance(sell.asset),
        price: sellSummary.weightedPrice,
        priceUSD: sellRate * sellSummary.weightedPrice,
        totalUSD: amount * sellRate * sellSummary.weightedPrice,
        fee: amount * sellRate * sellSummary.weightedPrice * sell.fee,
      },
      buy: {
        asset: buy.asset,
        market: buy.tag,
        amount: amount,
        amountBase: amount * buySummary.weightedPrice,
        available: buy.balance(buy.base),
        price: buySummary.weightedPrice,
        priceUSD: buyRate * buySummary.weightedPrice,
        totalUSD: amount * buyRate * buySummary.weightedPrice,
        fee: amount * buyRate * buySummary.weightedPrice * buy.fee,
      },
      execute: true,
      profit: null,
      notes: [],
    }
    action.profit =
      action.sell.totalUSD -
      (action.buy.totalUSD + action.buy.fee + action.sell.fee)
    if (action.profit < 0) {
      action.execute = false
      action.notes.push('No profit.')
    }
    if (action.sell.available < action.sell.amount) {
      action.execute = false
      action.notes.push(`Insufficient ${action.sell.asset} to sell.`)
    }
    if (action.buy.available < action.buy.amountBase) {
      action.execute = false
      action.notes.push(
        `Insufficient ${action.buy.market.split('-')[1]} to buy.`
      )
    }
    return action
  }
  logSummary() {
    console.log('------------------------')
    console.log(`Trade Summary: ${this._asset}`)
    console.log('------------------------')
    console.log(this._trade)
  }
}
