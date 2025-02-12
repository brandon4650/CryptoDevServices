import DigitalBackground from './components/DigitalBackground';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CryptoWebDev from './components/CryptoDevServices';
import QuotePage from './components/QuotePage';
import LiveChat from './components/LiveChat';
import { initializeChat, chatClient } from './utils/DiscordChatClient';
import BuilderPage from './components/builder/BuilderPage';
import GameModal from './components/GameModal';
import { Gamepad2 } from 'lucide-react';


function App() {
  const [chatInitialized, setChatInitialized] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);

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
              <CryptoWebDev onGameOpen={() => setIsGameOpen(true)} />
              <LiveChat chatInitialized={chatInitialized} />
            </>
          } 
        />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/chat" element={<LiveChat initialOpen={true} chatInitialized={chatInitialized} />} />
        <Route path="/builder" element={<BuilderPage />} />
      </Routes>
      
      <GameModal isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />
      
      {!window.location.pathname.includes('/chat') && chatInitialized && <LiveChat />}
    </Router>
  );
}

export default App;
