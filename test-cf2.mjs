import WebSocket from 'ws';
const ws = new WebSocket('wss://api.derivws.com/trading/v1/options/ws/public');
ws.on('open', () => {
  ws.send(JSON.stringify({
    contracts_for: "R_100"
  }));
});
ws.on('message', (data) => {
  const d = JSON.parse(data);
  const types = d.contracts_for?.available.map(c => c.contract_type);
  console.log([...new Set(types)]);
  process.exit(0);
});
