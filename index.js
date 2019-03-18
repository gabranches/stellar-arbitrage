require('dotenv').config()
const Arbitrage = require('./src/Arbitrage')
const Bittrex = require('./api/Bittrex')
const StellarDEX = require('./api/StellarDEX')


const timer = time => {
  return new Promise((resolve, reject) => {
    console.log(`\nWaiting ${time}ms...\n`)
    setTimeout(() => resolve(), time)
  })
}

run = async () => {
  try {
    await timer(10000)
    await new Arbitrage()
      .asset('MOBI')
      .addMarket('bittrex-BTC')
      .addMarket('sdex-XLM')
      .min(1000)
      .execute(true)
  } catch (error) {
    console.error(error)
  }
  run()
}
run()

