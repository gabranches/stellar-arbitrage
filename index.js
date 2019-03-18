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
      .execute(true)
  } catch (error) {
    console.error(error)
  }
  await timer(10000)
  run()
}
run()

const timer = time => {
  return new Promise((resolve, reject) => {
    console.log(`Waiting ${time}ms...`)
    setTimeout(() => resolve(), time)
  })
}
