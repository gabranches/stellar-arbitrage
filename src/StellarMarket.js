import Market from "./Market";

export default class StellarMarket extends Market {
  constructor() {
    
  }
  fetchOrderBook() {
    const asset = this.getAsset(this._asset)
    return new Promise((resolve, reject) => {
      this._server
        .orderbook(
          new stellar.Asset.native(),
          new stellar.Asset(asset.asset_code, asset.asset_issuer)
        )
        .call()
        .then(res => {
          this._orderBook = this.formatOrderBook(res)
          this._summary = this.getSummary(this._orderBook)
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
}