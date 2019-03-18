require('dotenv').config()
const Arbitrage = require('./src/Arbitrage')
const Bittrex = require('./api/Bittrex')
const StellarDEX = require('./api/StellarDEX')

run = async () => {
  try {
    await new Arbitrage()
      .asset('MOBI')
      .addMarket('bittrex-BTC')
      .addMarket('sdex-XLM')
      .min(1000)
      .execute(false)

  } catch (error) {
    console.error(error)
  }
}
run()
