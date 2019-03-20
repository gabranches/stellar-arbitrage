import stellar from 'stellar-sdk'
import { Exchange } from './Exchange'
import stellarAssets from '../data/stellarAssets.mjs'

export class StellarExchange extends Exchange {
  constructor(options = {}) {
    super(options)
    this._name = 'StellarDex'
    this._privateKey = process.env.STELLAR_PRIVATE_KEY
    this._sourceKeypair = stellar.Keypair.fromSecret(this._privateKey)
    this._publicKey = this._sourceKeypair.publicKey()
    this._apiUrl = 'https://horizon.stellar.org'
    this._server = new stellar.Server(this._apiUrl)
    this._base = options.base || 'XLM'
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
  fetchBalances() {
    return new Promise((resolve, reject) => {
      this._server
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
  getAsset(asset_code) {
    const asset = stellarAssets.filter(a => a.asset_code === asset_code)[0]
    if (asset) return asset
    throw Error(`Could not find asset ${asset_code}`)
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
  formatOrderBook(book) {
    book.bids.forEach(order => {
      order.price = 1 / order.price
      order.amount = Number(order.amount)
      delete order.price_r
    })
    book.asks.forEach(order => {
      order.price = 1 / order.price
      order.amount = Number(order.amount)
      delete order.price_r
    })
    return Exchange.sortOrderBook([
      {
        side: 'bids',
        orders: book.asks,
      },
      {
        side: 'asks',
        orders: book.bids,
      },
    ])
  }
  signOperation(xdr) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('Signing Stellar transaction...')
        stellar.Network.usePublicNetwork()
        const account = await this._server.loadAccount(this._publicKey)
        const fee = await this._server.fetchBaseFee()
        const transaction = new stellar.TransactionBuilder(account, { fee })
          .addOperation(xdr)
          .setTimeout(30)
          .build()
        transaction.sign(this._sourceKeypair)
        const res = await this._server.submitTransaction(transaction)
        if (res._links.transaction.href) {
          console.log('Stellar transaction signed.')
          resolve(res)
        } else {
          reject(Error('Failed to sign Stellar transaction.'))
        }
      } catch (error) {
        reject(error)
      }
    })
  }
}
