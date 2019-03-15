require('dotenv').config()
const Arbitrage = require('./src/Arbitrage')

run = async () => {
  try {
    const mobi = await new Arbitrage()
      .asset('MOBI')
      .addMarket('bittrex-BTC')
      .addMarket('sdex-XLM')
      .min(10000)
      .init()

    mobi.executeAll()

  } catch (error) {
    throw error
  }
}
run()
