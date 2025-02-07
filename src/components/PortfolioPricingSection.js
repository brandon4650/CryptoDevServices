import React, { useState } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';

const PortfolioItem = ({ imageSrc, title, description }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-blue-900/20 rounded-xl overflow-hidden">
        <div 
          className="relative group cursor-pointer overflow-hidden"
          onClick={() => setIsModalOpen(true)}
        >
          <img 
            src={imageSrc} 
            alt={title}
            className="w-full h-64 object-cover transform transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-cyan-400">{title}</h3>
              <p className="text-sm text-zinc-300">{description}</p>
            </div>
          </div>
        </div>
        <a 
          href="https://black-wallstreet.netlify.app/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block w-full p-4 text-center bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 transition-opacity font-medium"
        >
          Check it out
        </a>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-blue-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-cyan-400 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            <img 
              src={imageSrc} 
              alt={title}
              className="w-full h-auto rounded-xl"
            />
            <div className="mt-4">
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{title}</h3>
              <p className="text-zinc-300">{description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const PricingCard = ({ tier, price, features, isPopular }) => (
  <div className={`
    bg-blue-900/20 rounded-xl p-8 relative 
    ${isPopular ? 'border-2 border-transparent before:absolute before:inset-0 before:rounded-xl before:p-[2px] before:bg-gradient-to-r before:from-cyan-400 before:via-blue-500 before:to-cyan-400 before:bg-[length:200%_100%] before:animate-[borderShine_3s_linear_infinite]' : ''} 
    hover:bg-blue-900/30 transition-colors
  `}>
    {isPopular && (
      <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-1 rounded-full text-sm font-medium">
        Most Popular
      </span>
    )}
    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{tier}</h3>
    <div className="mb-6">
      <span className="text-4xl font-bold">${price}</span>
      <span className="text-zinc-400">/project</span>
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-3">
          <Check className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
          <span className="text-zinc-300">{feature}</span>
        </li>
      ))}
    </ul>
    <button className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
      isPopular 
        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90' 
        : 'border border-cyan-500/50 hover:bg-cyan-500/10'
    }`}>
      Get Started <ArrowRight className="h-4 w-4" />
    </button>
  </div>
);

const PortfolioPricingSection = () => {
  const portfolioItems = [
    {
      imageSrc: "/images/portfolio1.jpg",
      title: "Token Launch Platform",
      description: "A modern cryptocurrency token website with real-time price tracking and detailed tokenomics."
    }
    // Add more portfolio items as needed
  ];

  const pricingTiers = [
    {
      tier: "Basic",
      price: "150",
      features: [
        "Basic Website Design",
        "Mobile Responsive Layout",
        "Token Information Section",
        "Simple Roadmap Display",
        "How to Buy Guide",
        "Contract Address with Copy Feature",
        "Basic Social Links",
        "3-4 Content Sections",
        "5 Days Delivery"
      ]
    },
    {
      tier: "Standard",
      price: "300",
      isPopular: true,
      features: [
        "Everything in Basic, plus:",
        "Interactive Slideshows",
        "Advanced Design Elements",
        "Token Price Tracking",
        "Animated Sections",
        "Custom Graphics",
        "Team Information",
        "Extended Roadmap",
        "3 Days Delivery"
      ]
    },
    {
      tier: "Premium",
      price: "450",
      features: [
        "Everything in Standard, plus:",
        "Live Chart Integration",
        "Rug Checker Features",
        "Partnership Showcase",
        "Bubble Scanner Integration",
        "Detailed Token Analytics",
        "Regular Content Updates",
        "Priority Support",
        "24h Delivery"
      ]
    }
  ];

  return (
    <>
      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-6">Our Portfolio</h2>
          <p className="text-center text-xl text-zinc-300 mb-16 max-w-3xl mx-auto">
            Explore our latest crypto website projects and see how we bring digital assets to life.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioItems.map((item, index) => (
              <PortfolioItem key={index} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-blue-950/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-6">Simple Pricing</h2>
          <p className="text-center text-xl text-zinc-300 mb-16 max-w-3xl mx-auto">
            Choose the perfect package for your crypto project. All plans include responsive design and dedicated support.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <PricingCard key={index} {...tier} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default PortfolioPricingSection;
