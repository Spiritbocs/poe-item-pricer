export interface Currency {
  id: string;
  name: string;
  icon: string;
  chaosValue?: number;
  divineValue?: number;
  exaltedValue?: number;
  listingCount?: number;
  detailsId?: string;
}

export interface CurrencyDetails {
  id: string;
  icon: string;
  name: string;
  tradeId?: string;
}

export interface CurrencyRates {
  lines: Currency[];
  currencyDetails: CurrencyDetails[];
}

export interface CurrencyResponse {
  currencies: Currency[];
  divinePrice: number;
  timestamp: number;
}
