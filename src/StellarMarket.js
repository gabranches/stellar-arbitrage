import Market from './Market'
import StellarOrderBook from './StellarOrderBook'
import stellar from 'stellar-sdk'
import stellarAssets from '../data/stellarAssets'

export default class StellarMarket extends Market {
  constructor(params) {
    params.base = 'XLM'
    super(params)
  }
  fetchOrderBook() {
    const stellarAsset = this.getAsset(this._asset)
    return new Promise((resolve, reject) => {
      this._api.server
        .orderbook(
          new stellar.Asset.native(),
          new stellar.Asset(stellarAsset.asset_code, stellarAsset.asset_issuer)
        )
        .call()
        .then(res => {
          this._orderBook = new StellarOrderBook(res)
          resolve()
        })
        .catch(error => reject(error))
    })
  }
  limitOrder(order) {
    return new Promise(async (resolve, reject) => {
      const stellarAsset = this.getAsset(order.asset)
      const trade = {
        action: order.type,
        asset_code: stellarAsset.asset_code,
        asset_issuer: stellarAsset.asset_issuer,
        action_price: order.price,
      }
      const xdr = this.createTrade(trade, order.amount)
      try {
        const res = await this._api.signOperation(xdr)
        resolve(res)
      } catch (error) {
        reject(error)
      }
    })
  }
  createTrade(trade, amount) {
    let selling, buying, price
    if (trade.action === 'SELL') {
      selling = new stellar.Asset(trade.asset_code, trade.asset_issuer)
      buying = new stellar.Asset('XLM', null)
      price = trade.action_price - 0.001
    } else {
      selling = new stellar.Asset('XLM', null)
      buying = new stellar.Asset(trade.asset_code, trade.asset_issuer)
      amount = amount * trade.action_price
      price = 1 / trade.action_price - 0.001
    }
    const offer = {
      selling,
      buying,
      amount: amount.toFixed(7).toString(),
      price: price.toFixed(7).toString(),
    }
    return stellar.Operation.manageOffer(offer)
  }
  getAsset() {
    const asset = stellarAssets.filter(a => a.asset_code === this._asset)[0]
    if (asset) return asset
    throw Error(`Could not find asset ${this._asset}`)
  }
}
