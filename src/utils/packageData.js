export const SELL_APP_PACKAGES = [
  {
    storeId: "56234",
    productId: "273869",
    planName: "Basic Plan",
    price: "150",
    description: "Basic Website Design with Essential Features"
  },
  {
    storeId: "56234",
    productId: "273879",
    planName: "Standard Plan",
    price: "300",
    description: "Advanced Design with Interactive Elements"
  },
  {
    storeId: "56234",
    productId: "273880",
    planName: "Premium Plan",
    price: "450",
    description: "Full-Featured Website with Premium Integrations"
  }
];

// Helper function to normalize plan names for comparison
const normalizePlanName = (name) => {
  return name
    .toLowerCase()
    .replace(/\s+plan$/, '')  // Remove 'plan' from end
    .replace(/\s+/g, '')      // Remove all spaces
    .trim();
};

// Function to find matching package based on plan type
export const findMatchingPackage = (planType) => {
  if (!planType) return null;
  
  const normalizedInput = normalizePlanName(planType);
  
  return SELL_APP_PACKAGES.find(pkg => {
    const normalizedPackage = normalizePlanName(pkg.planName);
    return normalizedInput.includes(normalizedPackage) || 
           normalizedPackage.includes(normalizedInput);
  });
};

// Function to validate if a plan type is a quote
export const isQuoteType = (planType) => {
  if (!planType) return false;
  const normalized = planType.toLowerCase().trim();
  return normalized === 'quote' || 
         normalized === 'custom quote' || 
         normalized.includes('quote request');
};

// Export package names for easy reference
export const PACKAGE_TYPES = {
  BASIC: 'Basic Plan',
  STANDARD: 'Standard Plan',
  PREMIUM: 'Premium Plan'
};
