export default class API {
  constructor(params) {
    this._apiUrl = params.url
    this._publicKey = params.publicKey
    this._privateKey= params.privateKey
  }
  get url() {
    return this._apiUrl
  }
  get privateKey() {
    return this._privateKey
  }
  get publicKey() {
    return this._publicKey
  }
}