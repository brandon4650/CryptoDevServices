import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, Monitor, Cpu, Rocket, Shield, Globe, Database, 
  Layers, Terminal, CheckCircle, ArrowRight, Zap 
} from 'lucide-react';
import PortfolioPricingSection from './PortfolioPricingSection';

const CryptoWebDev = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="min-h-screen text-white relative z-10">
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
              <Link 
                to="/quote" 
                className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                Request Quote <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Layers className="h-6 w-6" />
            </button>
          </div>
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
                title: "Dapp Development",
                description: "Full-stack decentralized application development with modern frameworks."
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

      <PortfolioPricingSection />
    </div>
  );
};

export default CryptoWebDev;
