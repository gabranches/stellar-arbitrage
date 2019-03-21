import stellar from 'stellar-sdk'
import Exchange from './Exchange'
import StellarMarket from './StellarMarket';
import StellarAPI from './StellarAPI';

export default class StellarExchange extends Exchange {
  constructor(options = {}) {
    options.tag = 'sdex'
    options.name = 'Stellar Decentralized Exchange'
    options.fee = 0
    super(options)
    this._base = options.base || 'XLM'
    this._api = new StellarAPI()
    this._market = new StellarMarket(this._asset, this._api)
  }
  fetchBalances() {
    return new Promise((resolve, reject) => {
      this._api.server
        .accounts()
        .accountId(this._publicKey)
        .call()
        .then(res => {
          this._balances = this.formatBalances(res.balances)
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  }
  formatBalances(balances) {
    const newBal = []
    balances.forEach(b => {
      newBal.push({
        asset: b.asset_type === 'native' ? 'XLM' : b.asset_code,
        balance: Number(b.balance),
        available: b.balance - b.buying_liabilities - b.selling_liabilities,
      })
    })
    return newBal
  }
  fetchOpenOrders() {
    return new Promise((resolve, reject) => {
      this._server
        .offers('accounts', this._publicKey)
        .call()
        .then(offers => {
          this._openOrders = offers.records
          resolve()
        })
        .catch(error => reject(error))
    })
  }
}
