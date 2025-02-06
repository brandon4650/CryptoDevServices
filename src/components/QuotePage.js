import React, { useState } from 'react';
import { ArrowLeft, Info, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendToDiscord } from '../utils/discordWebhook';
import LiveChat from './LiveChat';

const QuotePage = () => {
    const [selectedOption, setSelectedOption] = useState('');
    const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [formType, setFormType] = useState(''); // 'plan' or 'quote'
    const [showChat, setShowChat] = useState(false);
    const [channelId, setChannelId] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [formData, setFormData] = useState({
        projectName: '',
        email: '',
        details: '',
        additionalInfo: '',
        twitterLink: '',
        telegramLink: '',
        discordLink: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const result = await sendToDiscord(
                formData,
                selectedOption || 'quote'
            );

            if (result.success) {
                setChannelId(result.channelId);
                setOrderData(result);
                setOrderComplete(true);
                // Reset form data
                setFormData({
                    projectName: '',
                    email: '',
                    details: '',
                    additionalInfo: '',
                    twitterLink: '',
                    telegramLink: '',
                    discordLink: ''
                });
            } else {
                throw new Error(result.error || 'Failed to submit');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting your request. Please try again later.');
        }
    };
    const pricingTiers = [
        {
            tier: "Basic",
            price: "150",
            features: [
                "Basic Website Design",
                "Less Interactive Elements",
                "Basic Information About the Coin",
                "Simple Roadmap Display",
                "How to Buy Guide",
                "Contract Address with Copy Feature",
                "Basic Social Links",
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
                "Price Track of Coin",
                "Advanced Design Elements",
                "Animated Sections",
                "Custom Graphics",
                "3 Days Delivery"
            ]
        },
        {
            tier: "Premium",
            price: "450",
            features: [
                "Everything in Standard, plus:",
                "Live Chart Integration",
                "Bubble Check Feature",
                "Rug Checker Integration",
                "Partnership Display",
                "Constant Updates",
                "24h Delivery"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black text-white">
            {/* Navigation */}
            <nav className="fixed w-full bg-blue-950/90 backdrop-blur-sm z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center h-16">
                        <Link to="/" className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto pt-32 px-4 pb-20">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Start Your Project
                </h1>

                {/* Back Button */}
                {(formType || selectedOption) && (
                    <button
                        onClick={() => {
                            setFormType('');
                            setSelectedOption('');
                        }}
                        className="mb-6 flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Options
                    </button>
                )}

                {/* Initial Selection */}
                {!formType && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button
                                onClick={() => setFormType('plan')}
                                className="p-8 rounded-xl border-2 border-blue-900/40 hover:border-cyan-400 transition-colors bg-blue-900/20 text-left"
                            >
                                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                    Choose a Plan
                                </h3>
                                <p className="text-zinc-300">
                                    Select from our pre-defined packages with clear pricing and features
                                </p>
                            </button>

                            <button
                                onClick={() => setFormType('quote')}
                                className="p-8 rounded-xl border-2 border-blue-900/40 hover:border-cyan-400 transition-colors bg-blue-900/20 text-left"
                            >
                                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                    Request a Quote
                                </h3>
                                <p className="text-zinc-300">
                                    Get a custom quote based on your specific requirements
                                </p>
                            </button>
                        </div>
                    </div>
                )}

                {/* Plan Selection */}
                {formType === 'plan' && !selectedOption && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pricingTiers.map((tier, index) => (
                            <div key={index} className={`bg-blue-900/20 rounded-xl p-8 relative ${tier.isPopular ? 'border-2 border-cyan-400' : ''}`}>
                                {tier.isPopular && (
                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-1 rounded-full text-sm font-medium">
                                        Most Popular
                                    </span>
                                )}
                                <h3 className="text-2xl font-bold mb-2">{tier.tier}</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">${tier.price}</span>
                                </div>
                                <ul className="space-y-4 mb-8 text-zinc-300">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => setSelectedOption(tier.tier)}
                                    className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${tier.isPopular
                                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90'
                                        : 'border border-cyan-500/50 hover:bg-cyan-500/10'
                                        }`}
                                >
                                    Select {tier.tier}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Selected Plan Form */}
                {selectedOption && (
                    <div className="space-y-6">
                        <div className="bg-blue-900/20 border border-cyan-400/20 rounded-lg p-6 mb-6">
                            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                Selected Plan: {selectedOption}
                            </h3>
                            <p className="text-zinc-300">
                                Please provide your project details below to get started with the {selectedOption} package.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-lg font-medium mb-2">
                                    Project/Site Name *
                                </label>
                                <input
                                    type="text"
                                    name="projectName"
                                    required
                                    value={formData.projectName}
                                    onChange={handleInputChange}
                                    className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
                                    placeholder="Enter your project name"
                                />
                            </div>

                            <div>
                                <label className="block text-lg font-medium mb-2">
                                    Contact Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
                                    placeholder="Enter your email address"
                                />
                            </div>

                            <div>
                                <label className="block text-lg font-medium mb-2">
                                    Project Details *
                                </label>
                                <textarea
                                    name="details"
                                    required
                                    value={formData.details}
                                    onChange={handleInputChange}
                                    className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white h-32"
                                    placeholder="Any specific requirements or preferences for your website..."
                                />
                            </div>

                            <div>
                                <label className="block text-lg font-medium mb-2">
                                    Social Links (Recommended)
                                </label>
                                <div className="space-y-4">
                                    <input
                                        type="url"
                                        name="twitterLink"
                                        value={formData.twitterLink}
                                        onChange={handleInputChange}
                                        className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
                                        placeholder="Twitter/X Profile Link"
                                    />
                                    <input
                                        type="url"
                                        name="telegramLink"
                                        value={formData.telegramLink}
                                        onChange={handleInputChange}
                                        className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
                                        placeholder="Telegram Group Link"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                Additional Information
                            </button>

                            {showAdditionalInfo && (
                                <div>
                                    <textarea
                                        name="additionalInfo"
                                        value={formData.additionalInfo}
                                        onChange={handleInputChange}
                                        className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white h-32"
                                        placeholder="Any additional details, preferences, or requirements..."
                                    />
                                </div>
                            )}

                            {/* Disclaimer */}
                            <div className="bg-blue-900/20 border border-cyan-400/20 rounded-lg p-4 flex items-start gap-3">
                                <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-zinc-300">
                                    By proceeding, you agree to the selected {selectedOption} package terms. All sales are final and no refunds will be provided.
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 transition-opacity rounded-lg py-4 font-medium text-lg"
                            >
                                Submit Order
                            </button>
                        </form>
                    </div>
                )}

                {/* Quote Form */}
                {formType === 'quote' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-lg font-medium mb-2">
                                Project/Site Name *
                            </label>
                            <input
                                type="text"
                                name="projectName"
                                required
                                value={formData.projectName}
                                onChange={handleInputChange}
                                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
                                placeholder="Enter your project name"
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium mb-2">
                                Contact Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
                                placeholder="Enter your email address"
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium mb-2">
                                Project Details *
                            </label>
                            <textarea
                                name="details"
                                required
                                value={formData.details}
                                onChange={handleInputChange}
                                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white h-32"
                                placeholder="Describe what features and functionality you need for your site..."
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-medium mb-2">
                                Social Links (Recommended)
                            </label>
                            <div className="space-y-4">
                                <input
                                    type="url"
                                    name="twitterLink"
                                    value={formData.twitterLink}
                                    onChange={handleInputChange}
                                    className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
                                    placeholder="Twitter/X Profile Link"
                                />
                                <input
                                    type="url"
                                    name="telegramLink"
                                    value={formData.telegramLink}
                                    onChange={handleInputChange}
                                    className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
                                    placeholder="Telegram Group Link"
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            Additional Information
                        </button>

                        {showAdditionalInfo && (
                            <div>
                                <textarea
                                    name="additionalInfo"
                                    value={formData.additionalInfo}
                                    onChange={handleInputChange}
                                    className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white h-32"
                                    placeholder="Any additional details, preferences, or requirements..."
                                />
                            </div>
                        )}

                        {/* Disclaimer */}
                        <div className="bg-blue-900/20 border border-cyan-400/20 rounded-lg p-4 flex items-start gap-3">
                            <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-zinc-300">
                                We'll review your requirements and provide a custom quote based on your specific needs. All sales are final and no refunds will be provided.
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 transition-opacity rounded-lg py-4 font-medium text-lg"
                        >
                            Submit Quote Request
                        </button>
                    </form>
                )}
                {/* Order Complete Modal */}
                
{orderComplete && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-blue-900/90 p-8 rounded-xl max-w-md w-full mx-4">
      <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Order Submitted Successfully!
      </h3>
      <p className="text-zinc-300 mb-4">
        Your order has been received. Please save your Channel ID for connecting to live support:
      </p>
      <div className="bg-blue-900/50 p-4 rounded-lg mb-4">
        <p className="text-sm text-zinc-400 mb-2">Channel ID:</p>
        <span className="text-2xl font-mono text-cyan-400">{channelId}</span>
      </div>
      {orderData?.orderNumber && (
        <div className="bg-blue-900/50 p-4 rounded-lg mb-4">
          <p className="text-sm text-zinc-400 mb-2">Order Number:</p>
          <span className="text-lg font-mono text-cyan-400">{orderData.orderNumber}</span>
        </div>
      )}
      <p className="text-zinc-300 mb-6">
        Use the Channel ID above to connect to live support anytime.
        <br />
        Save this information for future reference.
      </p>
      <div className="space-y-3">
        <button
          onClick={() => {
            setShowChat(true);
            // Copy channel ID to clipboard
            navigator.clipboard.writeText(channelId).then(() => {
              console.log('Channel ID copied:', channelId);
            }).catch(err => {
              console.error('Failed to copy:', err);
            });
          }}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 transition-opacity rounded-lg py-3 font-medium"
        >
          Open Live Chat
        </button>
        <button
          onClick={() => {
            setOrderComplete(false);
            setChannelId('');
            setOrderData(null);
            setFormType('');
            setSelectedOption('');
          }}
          className="w-full border border-cyan-500/50 hover:bg-cyan-500/10 transition-colors rounded-lg py-3 font-medium"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

{showChat && (
  <LiveChat 
    initialOpen={true}
    showChannelInput={true}
    defaultChannelId={channelId}
  />
)}
    {showChat && <LiveChat channelId={channelId} initialOpen={true} />}
            </div>
        </div>
    );
};

export default QuotePage;
