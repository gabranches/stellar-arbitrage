import Market from './Market'
import StellarOrderBook from './StellarOrderBook'

export default class StellarMarket extends Market {
  constructor(asset, base = 'XLM') {
    super(asset, base)
    this._tag = 'sdex'
  }
  fetchOrderBook() {
    const stellarAsset = this.getAsset(this._asset)
    return new Promise((resolve, reject) => {
      this._server
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
        const res = await this.signOperation(xdr)
        resolve(res)
      } catch (error) {
        reject(error)
      }
    })
  }
  getAsset() {
    const asset = stellarAssets.filter(a => a.asset_code === this._asset)[0]
    if (asset) return asset
    throw Error(`Could not find asset ${this._asset}`)
  }
}
