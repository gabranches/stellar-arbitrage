import stellar from 'stellar-sdk'
import Exchange from './Exchange'
import StellarMarket from './StellarMarket';
import StellarAPI from './StellarAPI';

export default class StellarExchange extends Exchange {
  constructor(params = {}) {
    params.tag = 'sdex'
    params.name = 'Stellar Decentralized Exchange'
    params.fee = 0
    params.api = new StellarAPI()
    super(params)
    this._market = new StellarMarket(params)
  }
  fetchBalances() {
    return new Promise((resolve, reject) => {
      this._api.server
        .accounts()
        .accountId(this._api.publicKey)
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
      this._api.server
        .offers('accounts', this._api.publicKey)
        .call()
        .then(offers => {
          this._openOrders = offers.records
          resolve()
        })
        .catch(error => reject(error))
    })
  }
}
