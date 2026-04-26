import WebSocket from 'ws';
const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');
ws.on('open', () => {
  ws.send(JSON.stringify({
    proposal: 1,
    amount: 10,
    basis: 'multiplier',
    contract_type: 'MULTUP',
    currency: 'USD',
    multiplier: 100,
    symbol: 'R_100'
  }));
});
ws.on('message', (data) => {
  console.log(data.toString());
  process.exit(0);
});
