import BittrexOrderBook from './BittrexOrderBook'
import BittrexMarket from './BittrexMarket'
import StellarOrderBook from './StellarOrderBook'
import StellarMarket from './StellarMarket'

export default [
  {
    tag: 'bittrex',
    name: 'Bittrex',
    orderBook: BittrexOrderBook,
    market: BittrexMarket,
  },
  {
    tag: 'sdex',
    name: 'Stellar Decentralized Exchange',
    orderBook: StellarOrderBook,
    market: StellarMarket,
  },
]
