// services/WebSocketService.js
class WebSocketService {
  constructor(tokenAddress) {
    this.tokenAddress = tokenAddress;
    this.callbacks = new Set();
    this.trades = [];
    this.batchedUpdates = [];
    this.updateInterval = null;
    this.ws = null;
  }

  connect() {
    // Connect to multiple sources for redundancy
    this.connectToPrimarySource();
    this.connectToBackupSource();
    this.startBatchProcessing();
  }

  connectToPrimarySource() {
    // Primary WebSocket connection (Jupiter/Raydium etc)
    this.ws = new WebSocket(`wss://your-primary-endpoint/${this.tokenAddress}`);
    
    this.ws.onmessage = (event) => {
      const trade = JSON.parse(event.data);
      this.processTrade(trade);
    };

    this.ws.onclose = () => {
      setTimeout(() => this.connectToPrimarySource(), 1000);
    };
  }

  processTrade(trade) {
    this.batchedUpdates.push({
      timestamp: Date.now(),
      price: trade.price,
      volume: trade.volume,
      type: trade.type,
      txHash: trade.txHash
    });
  }

  startBatchProcessing() {
    // Process updates every 100ms for smooth performance
    this.updateInterval = setInterval(() => {
      if (this.batchedUpdates.length > 0) {
        const updates = [...this.batchedUpdates];
        this.batchedUpdates = [];
        this.notifySubscribers(updates);
      }
    }, 100);
  }

  subscribe(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  notifySubscribers(updates) {
    this.callbacks.forEach(callback => callback(updates));
  }

  disconnect() {
    if (this.ws) this.ws.close();
    if (this.updateInterval) clearInterval(this.updateInterval);
  }
}

export default WebSocketService;
