import BittrexOrderBook from './BittrexOrderBook'
import BittrexMarket from './BittrexMarket'
import StellarOrderBook from './StellarOrderBook'
import StellarMarket from './StellarMarket'
import { BittrexExchange } from './BittrexExchange';
import { StellarExchange } from './StellarExchange';

export default [
  {
    tag: 'bittrex',
    name: 'Bittrex',
    exchange: BittrexExchange,
    orderBook: BittrexOrderBook,
    market: BittrexMarket,
  },
  {
    tag: 'sdex',
    name: 'Stellar Decentralized Exchange',
    exchange: StellarExchange,
    orderBook: StellarOrderBook,
    market: StellarMarket,
  },
]
