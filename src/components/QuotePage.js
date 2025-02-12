import React, { useState, useEffect } from 'react';
import { ArrowLeft, Info, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendToDiscord } from '../utils/discordWebhook';
import LiveChat from './LiveChat';
import { SELL_APP_PACKAGES } from '../utils/packageData';
import { useSearchParams } from 'react-router-dom';

const QuotePage = () => {
    const [searchParams] = useSearchParams();
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
    discordLink: '',
    // Make sure to initialize all nested objects
    technicalRequirements: {
        priceTracking: false,
        chart: false,
        swapInterface: false,
        customFeatures: ''
    },
    desiredIntegrations: {
        coinGecko: false,
        dexTools: false,
        other: ''
    },
    // Other new fields
    contractAddress: '',
    launchDate: '',
    deadline: '',
    tokenName: '',
    tokenSymbol: '',
    chain: '',
    marketingPlan: '',
    budgetRange: '',
    referenceSites: '',
    hostingPreference: '',
    colorScheme: '',
    existingSite: ''
});
    useEffect(() => {
        const plan = searchParams.get('plan');
        if (plan) {
            setFormType('plan');
            // Convert plan parameter to proper format (e.g., "basic-plan" to "Basic Plan")
            const formattedPlan = plan.split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            setSelectedOption(formattedPlan);
        }
    }, [searchParams]);

    const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested object properties
    if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [child]: value
            }
        }));
    } else {
        // Handle regular fields
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }
};

    const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [child]: checked
            }
        }));
    } else {
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    }
};


    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // Log the form submission type
        console.log('Submitting form with type:', selectedOption || 'quote');

        const result = await sendToDiscord(
            formData,
            selectedOption || 'quote'
        );

        if (result.success) {
            console.log('Discord submission successful:', result);
            setChannelId(result.channelId);
            setOrderData(result);
            setOrderComplete(true);

            // Store plan type only if it's not a quote
            if (selectedOption && selectedOption !== 'quote') {
                console.log('Finding package for:', selectedOption);
                // Find the matching package
                const selectedPlan = SELL_APP_PACKAGES.find(pkg => 
                    pkg.planName.toLowerCase() === selectedOption.toLowerCase()
                );
                console.log('Selected plan:', selectedPlan);

                if (selectedPlan) {
                    localStorage.setItem(`plan_${result.channelId}`, JSON.stringify(selectedPlan));
                    console.log('Stored plan data for channel:', result.channelId);
                }
            }

            // Reset form data
            setFormData({
    projectName: '',
    email: '',
    details: '',
    additionalInfo: '',
    twitterLink: '',
    telegramLink: '',
    discordLink: '',
    technicalRequirements: {
        priceTracking: false,
        chart: false,
        swapInterface: false,
        customFeatures: ''
    },
    desiredIntegrations: {
        coinGecko: false,
        dexTools: false,
        other: ''
    },
    contractAddress: '',
    launchDate: '',
    deadline: '',
    tokenName: '',
    tokenSymbol: '',
    chain: '',
    marketingPlan: '',
    budgetRange: '',
    referenceSites: '',
    hostingPreference: '',
    colorScheme: '',
    existingSite: ''
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
                "Basic Social Links"

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
                "Custom Graphics"
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
                "Constant Updates"
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
                               {/* Token/Project Details - For both forms */}
<div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-lg font-medium mb-2">
                Token Name {formType === 'plan' ? '*' : '(if available)'}
            </label>
            <input
                type="text"
                name="tokenName"
                required={formType === 'plan'}
                value={formData.tokenName}
                onChange={handleInputChange}
                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
                placeholder="Enter token name"
            />
        </div>
        <div>
            <label className="block text-lg font-medium mb-2">
                Token Symbol {formType === 'plan' ? '*' : '(if available)'}
            </label>
            <input
                type="text"
                name="tokenSymbol"
                required={formType === 'plan'}
                value={formData.tokenSymbol}
                onChange={handleInputChange}
                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
                placeholder="Enter token symbol"
            />
        </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-lg font-medium mb-2">
                Blockchain/Chain {formType === 'plan' ? '*' : '(if decided)'}
            </label>
            <select
                name="chain"
                required={formType === 'plan'}
                value={formData.chain}
                onChange={handleInputChange}
                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
            >
                <option value="">Select chain...</option>
                <option value="BSC">BSC (BNB Chain)</option>
                <option value="ETH">Ethereum</option>
                <option value="POLYGON">Polygon</option>
                <option value="OTHER">Other</option>
            </select>
        </div>
        <div>
            <label className="block text-lg font-medium mb-2">
                Contract Address {formType === 'plan' ? '*' : '(if available)'}
            </label>
            <input
                type="text"
                name="contractAddress"
                required={formType === 'plan'}
                value={formData.contractAddress}
                onChange={handleInputChange}
                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
                placeholder="Enter contract address"
            />
        </div>
    </div>

    {/* Timeline Fields */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-lg font-medium mb-2">
                Expected Launch Date {formType === 'plan' ? '*' : ''}
            </label>
            <input
                type="date"
                name="launchDate"
                required={formType === 'plan'}
                value={formData.launchDate}
                onChange={handleInputChange}
                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
            />
        </div>
        <div>
            <label className="block text-lg font-medium mb-2">
                Website Deadline *
            </label>
            <input
                type="date"
                name="deadline"
                required
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
            />
        </div>
    </div>

    {/* Technical Requirements */}
    <div>
        <label className="block text-lg font-medium mb-2">
            Technical Requirements *
        </label>
        <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    name="technicalRequirements.priceTracking"
                    checked={formData.technicalRequirements.priceTracking}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 rounded border-blue-900/40"
                />
                <label>Live Price Tracking</label>
            </div>
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    name="technicalRequirements.chart"
                    checked={formData.technicalRequirements.chart}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 rounded border-blue-900/40"
                />
                <label>Trading Chart Integration</label>
            </div>
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    name="technicalRequirements.swapInterface"
                    checked={formData.technicalRequirements.swapInterface}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 rounded border-blue-900/40"
                />
                <label>Swap Interface</label>
            </div>
        </div>
        <textarea
            name="technicalRequirements.customFeatures"
            value={formData.technicalRequirements.customFeatures}
            onChange={handleInputChange}
            className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white h-32"
            placeholder="Any other specific technical requirements or features..."
        />
    </div>

    {/* Marketing & Integrations */}
    <div>
        <label className="block text-lg font-medium mb-2">
            Desired Integrations
        </label>
        <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    name="desiredIntegrations.coinGecko"
                    checked={formData.desiredIntegrations.coinGecko}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 rounded border-blue-900/40"
                />
                <label>CoinGecko Integration</label>
            </div>
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    name="desiredIntegrations.dexTools"
                    checked={formData.desiredIntegrations.dexTools}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 rounded border-blue-900/40"
                />
                <label>DexTools Integration</label>
            </div>
        </div>
        <input
            type="text"
            name="desiredIntegrations.other"
            value={formData.desiredIntegrations.other}
            onChange={handleInputChange}
            className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
            placeholder="Other integrations needed..."
        />
    </div>

    {/* Reference Sites */}
    <div>
        <label className="block text-lg font-medium mb-2">
            Reference Websites
        </label>
        <textarea
            name="referenceSites"
            value={formData.referenceSites}
            onChange={handleInputChange}
            className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white h-32"
            placeholder="List any websites you'd like to use as inspiration..."
        />
    </div>

    {/* Quote-specific Fields */}
    {formType === 'quote' && (
        <div>
            <label className="block text-lg font-medium mb-2">
                Budget Range *
            </label>
            <select
                name="budgetRange"
                required
                value={formData.budgetRange}
                onChange={handleInputChange}
                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
            >
                <option value="">Select a range...</option>
                <option value="100-300">$100 - $300</option>
                <option value="300-500">$300 - $500</option>
                <option value="500-1000">$500 - $1000</option>
                <option value="1000+">$1000+</option>
            </select>
        </div>
    )}

    {/* Hosting Preferences */}
    <div>
        <label className="block text-lg font-medium mb-2">
            Hosting Preference *
        </label>
        <select
            name="hostingPreference"
            required
            value={formData.hostingPreference}
            onChange={handleInputChange}
            className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
        >
            <option value="">Select hosting preference...</option>
            <option value="our-hosting">Use Your Hosting Service</option>
            <option value="own-hosting">I Have My Own Hosting</option>
            <option value="undecided">Undecided/Need Consultation</option>
        </select>
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

{/* Token/Project Details */}
<div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-lg font-medium mb-2">
                Token Name (if available)
            </label>
            <input
                type="text"
                name="tokenName"
                value={formData.tokenName}
                onChange={handleInputChange}
                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
                placeholder="Enter token name"
            />
        </div>
        <div>
            <label className="block text-lg font-medium mb-2">
                Token Symbol (if available)
            </label>
            <input
                type="text"
                name="tokenSymbol"
                value={formData.tokenSymbol}
                onChange={handleInputChange}
                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
                placeholder="Enter token symbol"
            />
        </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-lg font-medium mb-2">
                Blockchain/Chain (if decided)
            </label>
            <select
                name="chain"
                value={formData.chain}
                onChange={handleInputChange}
                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
            >
                <option value="">Select chain...</option>
                <option value="BSC">BSC (BNB Chain)</option>
                <option value="ETH">Ethereum</option>
                <option value="POLYGON">Polygon</option>
                <option value="OTHER">Other</option>
            </select>
        </div>
        <div>
            <label className="block text-lg font-medium mb-2">
                Contract Address (if available)
            </label>
            <input
                type="text"
                name="contractAddress"
                value={formData.contractAddress}
                onChange={handleInputChange}
                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
                placeholder="Enter contract address"
            />
        </div>
    </div>

    {/* Budget Range (Quote-specific) */}
    <div>
        <label className="block text-lg font-medium mb-2">
            Budget Range *
        </label>
        <select
            name="budgetRange"
            required
            value={formData.budgetRange}
            onChange={handleInputChange}
            className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
        >
            <option value="">Select a range...</option>
            <option value="100-300">$100 - $300</option>
            <option value="300-500">$300 - $500</option>
            <option value="500-1000">$500 - $1000</option>
            <option value="1000+">$1000+</option>
        </select>
    </div>

    {/* Timeline Fields */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-lg font-medium mb-2">
                Expected Launch Date
            </label>
            <input
                type="date"
                name="launchDate"
                value={formData.launchDate}
                onChange={handleInputChange}
                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
            />
        </div>
        <div>
            <label className="block text-lg font-medium mb-2">
                Preferred Website Deadline
            </label>
            <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
            />
        </div>
    </div>

    {/* Technical Requirements */}
    <div>
        <label className="block text-lg font-medium mb-2">
            Desired Features
        </label>
        <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    name="technicalRequirements.priceTracking"
                    checked={formData.technicalRequirements.priceTracking}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 rounded border-blue-900/40"
                />
                <label>Live Price Tracking</label>
            </div>
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    name="technicalRequirements.chart"
                    checked={formData.technicalRequirements.chart}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 rounded border-blue-900/40"
                />
                <label>Trading Chart Integration</label>
            </div>
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    name="technicalRequirements.swapInterface"
                    checked={formData.technicalRequirements.swapInterface}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 rounded border-blue-900/40"
                />
                <label>Swap Interface</label>
            </div>
        </div>
        <textarea
            name="technicalRequirements.customFeatures"
            value={formData.technicalRequirements.customFeatures}
            onChange={handleInputChange}
            className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white h-32"
            placeholder="Any other specific features or requirements..."
        />
    </div>

    {/* Reference Sites */}
    <div>
        <label className="block text-lg font-medium mb-2">
            Reference Websites
        </label>
        <textarea
            name="referenceSites"
            value={formData.referenceSites}
            onChange={handleInputChange}
            className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white h-32"
            placeholder="List any websites you'd like to use as inspiration..."
        />
    </div>

    {/* Hosting Preferences */}
    <div>
        <label className="block text-lg font-medium mb-2">
            Hosting Preference
        </label>
        <select
            name="hostingPreference"
            value={formData.hostingPreference}
            onChange={handleInputChange}
            className="w-full bg-blue-900/20 border border-blue-900/40 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 text-white"
        >
            <option value="">Select hosting preference...</option>
            <option value="our-hosting">Use Your Hosting Service</option>
            <option value="own-hosting">I Have My Own Hosting</option>
            <option value="undecided">Undecided/Need Consultation</option>
        </select>
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
