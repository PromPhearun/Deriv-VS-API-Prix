import WebSocket from 'ws';
const ws = new WebSocket('wss://api.derivws.com/trading/v1/options/ws/public');
ws.on('open', () => {
  ws.send(JSON.stringify({
    contracts_for: "R_100"
  }));
});
ws.on('message', (data) => {
  const d = JSON.parse(data);
  const hl = d.contracts_for?.available.filter(c => c.contract_category === 'callput' || c.contract_category_display === 'Higher/Lower' || c.barrier_category === 'euro_non_atm');
  console.log(JSON.stringify(hl, null, 2));
  process.exit(0);
});
