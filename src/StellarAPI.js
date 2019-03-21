import stellar from 'stellar-sdk'
import API from './API'

export default class StellarAPI extends API {
  constructor() {
    const params = {
      url: 'https://api.bittrex.com/api/v1.1',
      privateKey: process.env.STELLAR_PRIVATE_KEY,
    }
    super(params)
    this._sourceKeypair = stellar.Keypair.fromSecret(this._privateKey)
    this._publicKey = this._sourceKeypair.publicKey()
    this._server = new stellar.Server(this._apiUrl)
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
  get server() {
    return this._server
  }
}
