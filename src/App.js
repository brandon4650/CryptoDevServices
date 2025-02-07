import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CryptoWebDev from './components/CryptoDevServices';
import QuotePage from './components/QuotePage';
import LiveChat from './components/LiveChat';
import { initializeChat, chatClient } from './utils/DiscordChatClient';
import DigitalBackground from './components/DigitalBackground';

function App() {
  const [chatInitialized, setChatInitialized] = useState(false);

  useEffect(() => {
    const startChat = async () => {
      try {
        console.log('Initializing chat client...');
        await initializeChat();
        console.log('Chat client connected successfully');
        setChatInitialized(true);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setTimeout(startChat, 5000);
      }
    };

    startChat();

    return () => {
      if (chatClient.ws) {
        console.log('Cleaning up chat client connection');
        chatClient.ws.close();
      }
    };
  }, []);

  return (
    <Router>
    <DigitalBackground />
      <Routes>
        <Route 
          path="/" 
          element={
            <>
              <CryptoWebDev />
              <LiveChat chatInitialized={chatInitialized} />
            </>
          } 
        />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/chat" element={<LiveChat initialOpen={true} chatInitialized={chatInitialized} />} />
      </Routes>
      {/* Render LiveChat globally */}
      {!window.location.pathname.includes('/chat') && chatInitialized && <LiveChat />}
    </Router>
  );
}

export default App;
