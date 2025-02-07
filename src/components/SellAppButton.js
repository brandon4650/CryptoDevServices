// components/SellAppButton.js
import React, { useEffect } from 'react';

const SellAppButton = ({ storeId, productId, planName, price }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.sell.app/embed/script.js';
    script.type = 'module';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <button
      data-sell-store={storeId}
      data-sell-product={productId}
      data-sell-darkmode={true}
      data-sell-theme=""
      className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-medium text-white hover:opacity-90 transition-opacity flex items-center justify-between"
    >
      <span>{planName}</span>
      <span>${price}</span>
    </button>
  );
};

export default SellAppButton;
