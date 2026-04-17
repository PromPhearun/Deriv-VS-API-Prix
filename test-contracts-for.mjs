import WebSocket from 'ws';
const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');
ws.on('open', () => {
  ws.send(JSON.stringify({ contracts_for: 'R_100' }));
});
ws.on('message', (data) => {
  const res = JSON.parse(data);
  const hl = res.contracts_for.available.filter(c => c.contract_category === 'callput' && c.barrier_category === 'euro_atm' || c.barrier_category === 'euro_non_atm' || c.contract_category_display === 'Higher/Lower');
  console.log(JSON.stringify(hl.slice(0, 5), null, 2));
  process.exit(0);
});
