const Bittrex = require('../api/Bittrex.js')
const StellarDex = require('../api/StellarDex')
const CoinMarketCap = require('../api/CoinMarketCap')

module.exports = {
  bittrex: Bittrex,
  sdex: StellarDex,
  cmc: CoinMarketCap,
}
