// components/SellAppButton.js
import React, { useEffect } from 'react';

const SellAppButton = ({ storeId, productId, darkMode = true }) => {
  useEffect(() => {
    // Load sell.app script
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
      data-sell-darkmode={darkMode}
      data-sell-theme=""
      className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
    >
      Buy Now!
    </button>
  );
};

export default SellAppButton;
