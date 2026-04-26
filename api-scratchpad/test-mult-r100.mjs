import WebSocket from 'ws';
const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');
ws.on('open', () => {
  ws.send(JSON.stringify({ contracts_for: 'R_100' }));
});
ws.on('message', (data) => {
  const res = JSON.parse(data);
  const mults = res.contracts_for.available.filter(c => c.contract_category === 'multiplier' || c.contract_type === 'MULTUP' || c.contract_type === 'MULTDOWN');
  console.log(JSON.stringify(mults.slice(0, 5), null, 2));
  process.exit(0);
});
