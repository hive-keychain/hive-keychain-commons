import { Exchange } from '../interfaces/exchange';

const getExchanges = (): Exchange[] => {
  return [
    {
      name: 'Binance',
      image: 'binance',
      link: 'https://www.binance.com/en/trade/HIVE_BTC',
      username: 'bdhivesteem',
      acceptedCoins: ['HIVE'],
    },
    {
      name: 'Upbit',
      image: 'upbit',
      link: 'https://id.upbit.com/exchange?code=CRIX.UPBIT.BTC-HIVE',
      username: 'user.dunamu',
      acceptedCoins: ['HIVE', 'HBD'],
    },
    {
      name: 'Gateio',
      image: 'gateio',
      link: 'https://www.gate.io/trade/HIVE_USDT',
      username: 'gateiodeposit',
      acceptedCoins: ['HIVE'],
    },
    {
      name: 'Huobi',
      image: 'huobi',
      link: 'https://www.huobi.com/en-us/exchange/hive_usdt/',
      username: 'huobi-pro',
      acceptedCoins: ['HIVE'],
    },
    {
      name: 'Mexc',
      image: 'mexc',
      link: 'https://www.mexc.com/exchange/HIVE_USDT',
      username: 'mxchive',
      acceptedCoins: ['HIVE'],
    },
  ];
};

export const ExchangesUtils = {
  getExchanges,
};
