// src/contexts/StyleContext.js
import React, { createContext, useContext, useState } from 'react';

const StyleContext = createContext();

export const StyleProvider = ({ children }) => {
  const [globalStyles, setGlobalStyles] = useState({
    fontStyle: 'default',
    buttonStyle: 'default',
    useGlobalColors: true,
    globalColor: '#1a1b1e',
    headerBg: '#1a1b1e',
    mainBg: '#1a1b1e',
    footerBg: '#1a1b1e',
  });

  const updateGlobalStyles = (newStyles) => {
    setGlobalStyles(newStyles);
  };

  const getButtonClasses = () => {
    const buttonStyles = {
      default: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90',
      outlined: 'border-2 border-current hover:bg-white/10',
      minimal: 'hover:bg-white/10',
      rounded: 'rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90',
      glass: 'backdrop-blur-sm bg-white/10 hover:bg-white/20'
    };

    return `px-4 py-2 transition-all duration-200 ${buttonStyles[globalStyles.buttonStyle || 'default']}`;
  };

  const getFontClasses = () => {
    const fontStyles = {
      default: 'font-sans',
      modern: 'font-mono',
      elegant: 'font-serif',
      playful: 'font-comic',
      bold: 'font-display',
      minimal: 'font-light'
    };

    return fontStyles[globalStyles.fontStyle || 'default'];
  };

  const getBackgroundStyle = (section) => {
    if (globalStyles.useGlobalColors) {
      return { backgroundColor: globalStyles.globalColor };
    }
    return { backgroundColor: globalStyles[`${section}Bg`] };
  };

  return (
    <StyleContext.Provider value={{
      globalStyles,
      updateGlobalStyles,
      getButtonClasses,
      getFontClasses,
      getBackgroundStyle
    }}>
      {children}
    </StyleContext.Provider>
  );
};

export const useStyle = () => {
  const context = useContext(StyleContext);
  if (!context) {
    throw new Error('useStyle must be used within a StyleProvider');
  }
  return context;
};

export default StyleContext;
