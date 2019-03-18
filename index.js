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

    // const b = new Bittrex({
    //   asset: 'MOBI',
    //   base: 'BTC',
    // })

    // const s = new StellarDEX({
    //   asset: 'MOBI',
    //   base: 'XLM',
    // })

    // await s.fetchOpenOrders()

    // console.log(s.openOrders)

  } catch (error) {
    console.error(error)
  }
}
run()
