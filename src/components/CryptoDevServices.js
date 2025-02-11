import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, 
  Monitor, 
  Cpu, 
  Rocket, 
  Shield, 
  Globe, 
  Database, 
  Layers, 
  Terminal, 
  CheckCircle, 
  ArrowRight, 
  Zap, 
  MessageCircle,  // Fixed spelling here
  FileText, 
  Menu, 
  X, 
  GameController
} from 'lucide-react';
import PortfolioPricingSection from './PortfolioPricingSection';
import GameModal from './GameModal';


const CryptoWebDev = ({ onGameOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  return (
<div className="min-h-screen bg-gradient-to-b from-blue-950 to-black text-white">
{/* Navigation */}
<nav className="fixed w-full bg-blue-950/90 backdrop-blur-sm z-50">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center">
        <Terminal className="h-8 w-8 text-cyan-500" />
        <span className="ml-2 text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          CryptoCraft.Dev
        </span>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="hover:text-cyan-400 transition-colors">Services</a>
              <a href="#process" className="hover:text-cyan-400 transition-colors">Process</a>
              <a href="#portfolio" className="hover:text-cyan-400 transition-colors">Portfolio</a>
              <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
              {/* Add the game button */}
              <button
                onClick={onGameOpen}
                className="hover:text-cyan-400 transition-colors flex items-center gap-2"
              >
                <GameController className="h-4 w-4" />
                Bored?
              </button>
        <Link 
          to="/quote" 
          className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          Request Quote <ArrowRight className="h-4 w-4" />
        </Link>
        <Link 
          to="/builder" 
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          Try Builder <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden text-cyan-400 hover:text-cyan-300 transition-colors" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Layers className="h-6 w-6" />
        )}
      </button>
    </div>

    {/* Mobile Menu Dropdown */}
    {isMenuOpen && (
      <div className="md:hidden absolute left-0 right-0 top-16 bg-blue-950/95 backdrop-blur-sm border-t border-blue-800/50">
        <div className="flex flex-col px-4 py-4 space-y-4">
          <a 
            href="#services" 
            onClick={() => setIsMenuOpen(false)}
            className="text-zinc-300 hover:text-cyan-400 transition-colors py-2"
          >
            Services
          </a>
          <a 
            href="#process" 
            onClick={() => setIsMenuOpen(false)}
            className="text-zinc-300 hover:text-cyan-400 transition-colors py-2"
          >
            Process
          </a>
          <a 
            href="#portfolio" 
            onClick={() => setIsMenuOpen(false)}
            className="text-zinc-300 hover:text-cyan-400 transition-colors py-2"
          >
            Portfolio
          </a>
          <a 
            href="#pricing" 
            onClick={() => setIsMenuOpen(false)}
            className="text-zinc-300 hover:text-cyan-400 transition-colors py-2"
          >
            Pricing
          </a>
              <button
                    onClick={onGameOpen}
                    className="text-zinc-300 hover:text-cyan-400 transition-colors py-2 flex items-center gap-2"
                  >
                    <GameController className="h-4 w-4" />
                    Bored?
                  </button>
          <Link 
            to="/quote" 
            onClick={() => setIsMenuOpen(false)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 px-6 py-3 rounded-lg font-medium transition-opacity text-center mt-2"
          >
            Request Quote
          </Link>
          <Link 
            to="/builder" 
            onClick={() => setIsMenuOpen(false)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 px-6 py-3 rounded-lg font-medium transition-opacity text-center"
          >
            Try Builder <ArrowRight className="inline h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    )}
  </div>
</nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Building the Future of <br/>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Crypto Websites
            </span>
          </h1>
          <p className="text-xl text-zinc-300 mb-12 max-w-3xl mx-auto">
            Transform your cryptocurrency project with cutting-edge web development. 
            We specialize in creating modern, secure, and high-performance websites 
            for tokens and DeFi projects.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/quote"
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-medium text-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Start Your Project <Rocket className="h-5 w-5" />
            </Link>
            <a 
              href="#portfolio"
              className="px-8 py-4 border border-cyan-500/50 rounded-lg font-medium text-lg hover:bg-cyan-500/10 transition-colors flex items-center gap-2"
            >
              View Portfolio <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-20 px-4 bg-blue-950/40">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="h-8 w-8 text-cyan-400" />,
                title: "Token Websites",
                description: "Custom-built websites for cryptocurrency tokens with real-time price integration and modern design."
              },
              {
                icon: <Shield className="h-8 w-8 text-cyan-400" />,
                title: "DeFi Platforms",
                description: "Secure and scalable platforms for decentralized finance applications and services."
              },
              {
                icon: <Cpu className="h-8 w-8 text-cyan-400" />,
                title: "Smart Contracts",
                description: "Integration of smart contracts with your website for seamless blockchain interaction."
              },
              {
                icon: <Monitor className="h-8 w-8 text-cyan-400" />,
                title: "Web3 Website Development",
                description: "Building modern, blockchain-enabled websites with Web3 connectivity for seamless crypto interactions."
              },
              {
                icon: <Database className="h-8 w-8 text-cyan-400" />,
                title: "API Integration",
                description: "Integration with major crypto APIs for real-time data and analytics."
              },
              {
                icon: <Zap className="h-8 w-8 text-cyan-400" />,
                title: "Performance",
                description: "Optimized for speed and responsiveness across all devices and platforms."
              }
            ].map((service, index) => (
              <div key={index} className="bg-blue-900/20 p-6 rounded-xl hover:bg-blue-900/30 transition-colors backdrop-blur-sm">
                <div className="bg-blue-900/40 w-fit p-3 rounded-lg mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-zinc-300">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



{/* Process Section */}
<section id="process" className="py-20 px-4">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-4xl font-bold text-center mb-6">How It Works</h2>
    <p className="text-center text-xl text-zinc-300 mb-16 max-w-3xl mx-auto">
      Our streamlined process makes getting your crypto website quick and hassle-free
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        {
          step: "1",
          title: "Choose Your Plan",
          description: "Select from our Basic, Standard, or Premium packages based on your project needs",
          icon: <Rocket className="h-8 w-8 text-cyan-400" />,
          details: [
            "Review package features",
            "Compare pricing options",
            "Select the best fit"
          ]
        },
        {
          step: "2",
          title: "Submit Details",
          description: "Fill out our simple form with your project requirements and preferences",
          icon: <FileText className="h-8 w-8 text-cyan-400" />,
          details: [
            "Provide project name",
            "Share social links",
            "Describe special requirements"
          ]
        },
        {
          step: "3",
          title: "Connect Support",
          description: "Get instant access to your dedicated support chat for real-time communication",
          icon: <MessageCircle className="h-8 w-8 text-cyan-400" />,
          details: [
            "Receive channel ID",
            "Connect to live chat",
            "Discuss project details"
          ]
        },
        {
          step: "4",
          title: "Complete Purchase",
          description: "Finalize your order through our secure payment system and we'll begin work",
          icon: <CheckCircle className="h-8 w-8 text-cyan-400" />,
          details: [
            "Review final details",
            "Complete payment",
            "Start development"
          ]
        }
      ].map((item, index) => (
        <div 
          key={index} 
          className="relative bg-blue-900/20 p-8 rounded-xl hover:bg-blue-900/30 transition-all group"
        >
          {/* Step Number */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
            {item.step}
          </div>

          {/* Icon */}
          <div className="bg-blue-900/40 w-fit p-3 rounded-lg mb-4 group-hover:scale-110 transition-transform">
            {item.icon}
          </div>

          {/* Content */}
          <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
          <p className="text-zinc-300 mb-4">{item.description}</p>

          {/* Details */}
          <ul className="space-y-2">
            {item.details.map((detail, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="h-1 w-1 rounded-full bg-cyan-400"></div>
                {detail}
              </li>
            ))}
          </ul>

          {/* Connector Line (except for last item) */}
          {index < 3 && (
            <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-cyan-600 to-blue-600 transform -translate-y-1/2"></div>
          )}
        </div>
      ))}
    </div>

    {/* Call to Action */}
    <div className="mt-16 text-center">
      <Link 
        to="/quote" 
        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-medium text-lg hover:opacity-90 transition-opacity"
      >
        Start Your Project <ArrowRight className="h-5 w-5" />
      </Link>
      <p className="mt-4 text-zinc-400">
        Questions? Connect with live support for immediate assistance
      </p>
    </div>
  </div>
</section>

      <PortfolioPricingSection />
    </div>
  );
};

export default CryptoWebDev;
