import dotenv from 'dotenv'
import { Arbitrage } from './Arbitrage'

dotenv.config()

const timer = time => {
  return new Promise((resolve, reject) => {
    console.log(`\nWaiting ${time}ms...\n`)
    setTimeout(() => resolve(), time)
  })
}

const run = async () => {
  try {
    // await timer(10000)
    await new Arbitrage()
    .asset('MOBI')
    .addMarket('bittrex-BTC')
    .addMarket('sdex-XLM')
    .min(1000)
    .execute(false)
  } catch (error) {
    console.error(error)
  }
  // run()
}

run()
