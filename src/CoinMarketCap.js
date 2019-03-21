import _ from 'lodash'
import axios from 'axios'

export default class CoinMarketCap {
  constructor() {
    this._privateKey = process.env.COINMARKETCAP_PRIVATE_KEY
    this._apiUrl =
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=100&convert=USD'
  }
  price(pair, base) {
    const pairUSD = _.find(this._data, { symbol: pair }).quote.USD.price
    let baseUSD
    if (base === 'USD') {
      baseUSD = 1
    } else {
      baseUSD = _.find(this._data, { symbol: base }).quote.USD.price
    }
    return pairUSD / baseUSD
  }
  fetchData() {
    return new Promise((resolve, reject) => {
      axios
        .get(this._apiUrl, {
          headers: {
            'X-CMC_PRO_API_KEY': this._privateKey,
            Accept: 'application/json',
          },
        })
        .then(res => {
          this._data = res.data.data
          resolve()
        })
        .catch(error => reject(error))
    })
  }
}
