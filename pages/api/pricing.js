import { useState, useEffect } from 'react';

export default function Pricing() {
  const [exchangeRates, setExchangeRates] = useState({});
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');

  useEffect(() => {
    fetch('/api/currency')
      .then((res) => res.json())
      .then((data) => setExchangeRates(data.rates));
  }, []);

  const priceGBP = 700;
  const convertedPrice = (priceGBP * (exchangeRates[selectedCurrency] || 1)).toFixed(2);

  return (
    <main>
      <h1>Pricing</h1>
      <label>Choose currency:
        <select onChange={(e) => setSelectedCurrency(e.target.value)}>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
          <option value="GBP">GBP</option>
        </select>
      </label>
      <p>Pallet price: {convertedPrice} {selectedCurrency}</p>
    </main>
  );
}
