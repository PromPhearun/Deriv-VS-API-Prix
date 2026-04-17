import WebSocket from 'ws';
const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');
ws.on('open', () => {
  ws.send(JSON.stringify({ contracts_for: '1HZ100V' }));
});
ws.on('message', (data) => {
  const res = JSON.parse(data);
  const contracts = res.contracts_for;
  
  const hasHigherLower = contracts.available.some(
    (c) => c.barrier_category === "euro_non_atm"
  );
  
  console.log('1HZ100V hasHigherLower:', hasHigherLower);
  process.exit(0);
});
