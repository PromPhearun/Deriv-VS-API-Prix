import WebSocket from 'ws';
const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');
ws.on('open', () => {
  ws.send(JSON.stringify({ contracts_for: 'R_100' }));
});
ws.on('message', (data) => {
  const res = JSON.parse(data);
  const hl = res.contracts_for.available.filter(c => c.barrier_category === 'euro_non_atm');
  console.log('Total euro_non_atm contracts:', hl.length);
  const hasTicks = hl.some(c => c.min_contract_duration && c.min_contract_duration.endsWith('t'));
  console.log('Has ticks?', hasTicks);
  console.log(JSON.stringify(hl.find(c => c.min_contract_duration && c.min_contract_duration.endsWith('t')), null, 2));
  process.exit(0);
});
