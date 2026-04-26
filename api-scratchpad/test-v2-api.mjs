import WebSocket from 'ws';
const ws = new WebSocket('wss://api.derivws.com/trading/v1/options/ws/public');
ws.on('open', () => {
  ws.send(JSON.stringify({ active_symbols: 'brief' }));
  ws.send(JSON.stringify({ contracts_for: '1HZ100V' }));
});
ws.on('message', (data) => {
  const res = JSON.parse(data);
  if (res.contracts_for) {
    console.log('Got contracts_for!');
    const hl = res.contracts_for.available.filter(c => c.barrier_category === 'euro_non_atm');
    console.log('euro_non_atm count:', hl.length);
    if (hl.length === 0) {
      console.log('Sample contract:', res.contracts_for.available[0]);
      
      const allCategories = new Set(res.contracts_for.available.map(c => c.barrier_category));
      console.log('All barrier categories:', Array.from(allCategories));
    }
    process.exit(0);
  }
});
