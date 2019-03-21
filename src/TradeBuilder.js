import _ from 'lodash'

export class TradeBuilder {
  constructor(cmc) {
    this._cmc = cmc
  }
  sell(exchange) {
    this._sellExchange = exchange
    this._sellMarket = exchange.market
    return this
  }
  buy(exchange) {
    this._buyExchange = exchange
    this._buyMarket = exchange.market
    return this
  }
  min(min) {
    this._min = min
    this._max = min * 2
    return this
  }

  execute(exec) {
    return new Promise(async (resolve, reject) => {
      this._asset = this._sellMarket.asset
      this._sellMarket.orderBook.min = this._min
      this._sellMarket.orderBook.buildSummary()
      this._buyMarket.orderBook.min = this._min
      this._buyMarket.orderBook.buildSummary()
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
    const sellSummary = _.find(sell.orderBook.summary, { side: 'bids' })
    const buySummary = _.find(buy.orderBook.summary, { side: 'asks' })
    const sellRate = this._cmc.price(sell.base, 'USD')
    const buyRate = this._cmc.price(buy.base, 'USD')
    const amount = Math.min(sellSummary.totalAmount, buySummary.totalAmount)
    const action = {
      sell: {
        asset: sell.asset,
        market: sell.tag,
        amount: amount,
        available: this._sellExchange.balance(sell.asset),
        price: sellSummary.weightedPrice,
        priceUSD: sellRate * sellSummary.weightedPrice,
        totalUSD: amount * sellRate * sellSummary.weightedPrice,
        fee: amount * sellRate * sellSummary.weightedPrice * this._sellExchange.fee,
      },
      buy: {
        asset: buy.asset,
        market: buy.tag,
        amount: amount,
        amountBase: amount * buySummary.weightedPrice,
        available: this._buyExchange.balance(buy.base),
        price: buySummary.weightedPrice,
        priceUSD: buyRate * buySummary.weightedPrice,
        totalUSD: amount * buyRate * buySummary.weightedPrice,
        fee: amount * buyRate * buySummary.weightedPrice * this._buyExchange.fee,
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
      action.notes.push(`Insufficient ${sell.asset} to sell.`)
    }
    if (action.buy.available < action.buy.amountBase) {
      action.execute = false
      action.notes.push(
        `Insufficient ${buy.base} to buy.`
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
