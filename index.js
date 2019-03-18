require('dotenv').config()
const Arbitrage = require('./src/Arbitrage')
const Bittrex = require('./api/Bittrex')
const StellarDex = require('./api/StellarDex')

run = async () => {
  try {
    await new Arbitrage()
      .asset('MOBI')
      .addMarket('bittrex-BTC')
      .addMarket('sdex-XLM')
      .min(10000)
      .execute(false)

  } catch (error) {
    console.error(error)
  }
}
run()
